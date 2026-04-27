# Resource Center Phase 4 Night Run

## Step 2 - auth.ts / session dual-mode preparation
- Step 名称：Step 2 - 扩展 auth.ts / session 双模式能力
- 修改文件：
  - `src/types/resource-center.ts`
  - `src/lib/resource-center/auth.ts`
- 自检结果：
  - `ResourceSession` 已支持 `authMode`、`userId`、`username`、`role`、`expiresAt`。
  - `RC_AUTH_DB_ENABLED=false` 时仅接受 env session，现有 env cookie 仍可按旧结构解析为 env session。
  - `RC_AUTH_DB_ENABLED=true` 时仅接受 `authMode=db` 且带 `userId` 的 session，并通过 DB 用户与角色复核。
  - 旧 cookie 策略：切到 DB auth 后旧 env cookie 不再通过复核，需要重新登录。
  - 已新增异步 `getVerifiedRequestResourceSession`，保留现有同步 `getRequestResourceSession` 供后续 Step 4 控制影响面迁移。
  - `npm.cmd run build` 通过。
- 是否进入下一步：是。

## Step 6 - Phase 4 final acceptance
- Step 名称：Step 6 - Phase 4 总验收
- 修改文件：
  - 无业务代码新增；仅继续更新本日志。
- 自检结果：
  - flag=false：
    - env 用户认证成功：`envLoginSuccess=true`
    - env 错误密码失败：`envLoginFailure=true`
    - env session 可复核：`authMode=env`、`role=admin`
    - 后台资源 API：`GET /api/admin/resources -> 200`
  - flag=true：
    - DB 用户正确密码成功：`p4_night_admin -> admin`
    - DB 错误密码失败：`true`
    - disabled 用户失败：`true`
    - 无角色用户失败：`true`
    - DB session 复核成立：`userId + username + role`
    - 后台资源 API：`GET /api/admin/resources -> 200`
    - 无 cookie 访问后台资源 API：`401`
    - disabled 用户 cookie 被拒绝：`true`
    - 旧 env cookie 在 DB 模式下被拒绝：`true`
  - RBAC：
    - admin/editor 双角色解析为 `admin`
    - editor session 可识别为 `editor`
    - 无角色用户失败
  - 不回归破坏：
    - 前台资源读取仍可调用：DB read count `5`，JSON fallback count `5`
    - `.data/resource-center/resources.json` SHA256：`47325285E5EE655C0059D4259CC01B4A21BCE7239943590610B51866390A28B6`
    - 临时验收用户清理完成：`cleanupRemainingUsers=0`
  - `npm.cmd run build` 通过。
- 是否进入下一步：Phase 4 总验收通过，无下一步。

## Step 5 - login page minimal dual-mode copy
- Step 名称：Step 5 - 登录页与错误提示最小适配
- 修改文件：
  - `src/app/admin/login/page.tsx`
- 自检结果：
  - 页面结构、表单 action、按钮样式未重做。
  - `RC_AUTH_DB_ENABLED=false` 时仍检查 `RESOURCE_CENTER_USERS`，未配置时禁用登录。
  - `RC_AUTH_DB_ENABLED=true` 时登录页显示 DB 用户来源，不再因 env users 为空禁用提交。
  - 失败提示仍通过 `error` query 展示，不泄露认证细节。
  - `npm.cmd run build` 通过。
- 是否进入下一步：是。

## Step 4 - admin page/API auth entry migration
- Step 名称：Step 4 - 后台 page/API 鉴权入口接入新 session/auth 模式
- 修改文件：
  - `src/app/api/admin/resources/route.ts`
  - `src/app/api/admin/resources/[id]/route.ts`
- 自检结果：
  - 资源后台 API 已从同步 `getRequestResourceSession` 切到异步 `getVerifiedRequestResourceSession`。
  - `RC_AUTH_DB_ENABLED=false` 时 env session 继续可通过。
  - `RC_AUTH_DB_ENABLED=true` 时 DB session 会经过 userId、用户状态、角色复核。
  - 无效 session、旧 env cookie 在 DB 模式下不会通过。
  - 写入审计 actor 开始传递 `actorUserId`，不改变资源业务写入规则。
  - 后台页面已通过既有 `requireResourceSession()` 走新复核路径，无需额外改页面结构。
  - `npm.cmd run build` 通过。
- 是否进入下一步：是。

## Step 3 - login/logout API dual-mode authentication
- Step 名称：Step 3 - 切换登录/退出 API 到双模式认证
- 修改文件：
  - `src/app/api/admin/auth/login/route.ts`
- 自检结果：
  - `RC_AUTH_DB_ENABLED=false` 时保留 `authenticateResourceUser` env 登录链路，并写入 `authMode=env` session。
  - `RC_AUTH_DB_ENABLED=true` 时改走 `authenticateDbResourceUser`，成功后写入 `authMode=db`、`userId`、`username`、`role`、`expiresAt` session。
  - 登录失败统一重定向到 `Invalid username or password`，不泄露用户不存在、密码错误、disabled、无角色的差异。
  - logout route 继续复用 `clearResourceSession()`，两种 session 均通过同一 cookie 清理逻辑清除。
  - `npm.cmd run build` 通过。
- 是否进入下一步：是。
