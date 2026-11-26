# 询盘数据库锁治理设计（LOCK_GOVERNANCE）

状态：**设计稿，未实现**。
适用范围：`inquiry_records` 留存清理（purge）、人工重试、管理员读取、每日留存 Cron。
本文件不改变任何运行时行为，不含 Migration，不涉及生产环境变量。

## 1. 背景与目标

询盘留存清理与人工重试会并发访问同一批 `inquiry_records` 行。当前实现已通过 `FOR UPDATE` 锁定候选行、在 DELETE 上做二次条件校验、并从 `deleted` CTE 生成审计，保证"不误删、不重复审计"。但仍缺少统一的锁等待上限与重试策略：

- 单语句可能长时间等待行锁，占住连接；
- 死锁（`40P01`）或锁不可用（`55P03`）时没有有界重试；
- 清理任务进程崩溃后可能留下 `running` 租约，阻塞后续任务。

目标：**快速失败、有限重试、不吞错误、可观测**。不得因此扩大删除范围，不得把 `UNCERTAIN` 询盘转为可重试。

## 2. 设计原则

1. 只在事务内使用 `SET LOCAL`，**禁止** `ALTER DATABASE` / `ALTER SYSTEM` / 全局 `postgresql.conf` 修改。
2. 仅锁竞争类错误可重试，其余立即抛出。
3. 重试不改变业务判定条件（状态白名单、`smtp_outcome`、`retain_until` 仍由 SQL 决定）。
4. 租约恢复只处理 `inquiry_retention_runs`，不直接触碰询盘记录。
5. 全部行为可观测：重试次数、错误码、耗时进入现有告警/日志通道，且沿用既有脱敏规则。

## 3. 参数

| 项 | 值 | 说明 |
| --- | --- | --- |
| `lock_timeout` | `3s` | 单语句等待行锁上限 |
| `statement_timeout` | `15s` | 单语句总上限 |
| 可重试错误码 | `40P01`（deadlock_detected）、`55P03`（lock_not_available） | 仅锁竞争 |
| 不重试错误码 | `57014`（statement_timeout）、`23505`、`42501`、未知 | 超时不等于锁竞争，重试会放大负载 |
| 最大尝试次数 | 4（首次 + 3 次重试） | 有界 |
| 退避 | 50ms / 100ms / 200ms + 抖动 | 避免同步争用 |
| 租约超时 | 5 分钟 | 超时 `running` 视为失败，可重新申领 |
| 隔离级别 | `READ COMMITTED` | 与现有 purge 快照语义一致 |

## 4. 参考实现（伪代码）

```ts
const RETRYABLE = new Set(['40P01', '55P03']);
const ATTEMPTS = 4;
const BACKOFF_MS = [50, 100, 200];

export async function withLockPolicy<T>(
  client: PoolClient,
  fn: () => Promise<T>,
  opts: { attempts?: number } = {},
): Promise<T> {
  const attempts = opts.attempts ?? ATTEMPTS;
  await client.query("set local lock_timeout = '3s'");
  await client.query("set local statement_timeout = '15s'");
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (attempt === attempts - 1 || !code || !RETRYABLE.has(code)) throw err;
      await sleep(BACKOFF_MS[attempt] + Math.random() * 25);
    }
  }
  throw new Error('unreachable');
}
```

租约恢复（示意，不改表结构）：

```sql
update inquiry_retention_runs
   set status = 'failed', finished_at = now()
 where status = 'running'
   and started_at < now() - interval '5 minutes'
returning run_date;
```

随后由既有 `on conflict (run_date) do nothing` 重新申领当日任务；真正的删除仍由 `FOR UPDATE` + DELETE 二次条件保证幂等。

## 5. 测试方案

### 5.1 单元（无数据库）

| 用例 | 期望 |
| --- | --- |
| `40P01` 第 1/2/3 次后成功 | 返回成功，重试计数正确 |
| `40P01` 连续 4 次 | 抛出原始错误，恰好 4 次尝试 |
| `55P03` 同 `40P01` | 同上 |
| `57014` | 立即抛出，0 次重试 |
| `23505` / `42501` / 未知错误 | 立即抛出 |
| 退避序列 | 单调递增且含抖动 |
| `SET LOCAL` 作用域 | 事务外不残留 |

### 5.2 真实 PostgreSQL（隔离临时库）

1. 双会话同时 purge 同一批过期记录：仅一方删除，审计行数 = 删除行数。
2. purge 期间把候选状态改为 `notification_failed`：不删除，审计为空。
3. purge 期间改为 `notified + accepted`：允许删除，审计完整。
4. 人工重试与 purge 并发：`notification_pending` 不被删除。
5. 人为制造 `40P01`：最多 4 次尝试后成功或明确失败。
6. 慢查询触发 `statement_timeout`：被取消且**不重试**。
7. 崩溃残留 `running` 租约：5 分钟后可重新申领，旧记录标记 failed，不重复删数据。

### 5.3 门禁

`tsc --noEmit`、`eslint --max-warnings=0`、完整单元测试、22 项数据库集成测试、上述锁测试全部通过；production build 与六个关键 URL 复验。**禁止使用生产库执行任何测试。**

## 6. 风险与缓解

| 风险 | 影响 | 缓解 |
| --- | --- | --- |
| `statement_timeout=15s` 对大批量 purge 过紧 | 任务被取消，留存数据堆积 | 先只读压测单批耗时；必要时改分批删除，而非放宽超时 |
| 重试放大瞬时负载 | 高峰期争用加剧 | 有界重试 + 退避 + 抖动；仅两个错误码可重试 |
| 租约恢复误判长任务 | 双重执行 | 恢复前校验 `started_at`；删除仍由 `FOR UPDATE` + 二次条件保证幂等 |
| 误改全局数据库参数 | 影响其他业务 | 代码审查禁止 `ALTER DATABASE/SYSTEM`；只允许 `SET LOCAL` |
| 与 #26/#40 同文件并发修改 | 合并冲突 | 排在 #26/#40 之后启动，基于最新 main 拉分支 |

## 7. 实施顺序（待批准）

1. `src/lib/inquiries/db-lock-policy.ts` + 单元测试（不接入调用方）。
2. 接入 `durable-store.ts` 的 purge 与 `retention-cleanup.ts`。
3. 租约恢复逻辑 + 数据库测试。
4. 文档与值班手册更新。
5. 全量门禁 + 独立 PR 审查。

## 8. 非目标

- 不修改 `prisma/migrations/*` 与表结构。
- 不修改生产环境变量、Vercel 配置、Cron 计划。
- 不改变 `UNCERTAIN` 不自动重发的既有规则。
- 不调整留存天数与状态机语义。
