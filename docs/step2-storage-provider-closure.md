# Step 2 主链路闭环修复验收说明

## 1. 本轮修改目标
将上传主链路从 `storage.ts` 直连本地 provider，调整为通过 provider 选择器分发，形成配置可生效的最小闭环：`storage.ts -> getResourceStorageProvider() -> provider.store(...)`。  
约束是只做最小改动，不改 API 路由调用方式，不做额外抽象，不改变 local provider 现有行为。

## 2. 实际修改文件
- `src/lib/resource-center/storage.ts`

## 3. 修改前后主链路变化
- 修改前：`API route -> storage.ts -> local.ts`
- 修改后：`API route -> storage.ts -> providers/index.ts -> config.ts -> local.ts`  
  （当配置为 `object` 时在 `providers/index.ts` 按当前设计显式报错，不静默回退）

## 4. 已完成项
- `storage.ts` 不再硬编码调用 `localResourceStorageProvider.store(...)`。
- `storage.ts` 已接入 `getResourceStorageProvider()`，主链路进入 provider selector。
- API 路由调用方式保持不变（仍调用 `storeResourceFile`）。
- `local` provider 的上传行为保持不变（文件类型、大小限制、落盘路径、返回结构均未改）。
- `object` 未实现时继续显式失败，符合当前设计要求。

## 5. 未完成项
- `object` provider 仍未实现，仅保留显式报错分支。
- provider 架构层面的配套测试尚未补齐（如 provider 选择与失败策略测试）。
- 独立 `tsc --noEmit` 的环境性问题（`.next/types` 缺失）尚未治理。

## 6. 验证结果
- build
  - 执行：`npm run build`
  - 结果：通过
- tsc
  - 执行：`npx tsc --noEmit`
  - 结果：未通过，报错为 `.next/types/**/*.ts` 对应文件缺失（TS6053）
- 当前风险说明
  - 本次改动已完成主链路闭环，但 provider 架构仍处于“local 可用、object 占位”阶段。
  - `tsc` 失败来自项目类型检查环境/产物状态，不是本次 `storage.ts` 接线改动引入的功能回归。

## 7. 是否满足 Step 2 完成标准
**YES**

这里的 Step 2 明确指“主链路闭环修复”，不是“provider 架构整体完成”。  
按这个口径，本次已完成：主链路已从直连 local 改为经 provider selector 分发，并保留 `object` 显式失败策略。

## 8. 下一步最小动作
在不扩大发散的前提下，最小推进建议是补一条针对 `storeResourceFile` 的分发测试（覆盖 `local` 与 `object` 未实现时显式报错），用于锁定本次闭环成果、防止后续回退。

