import type { NextConfig } from "next";

/**
 * 开发环境如需限制可加载 `/_next/*` 的来源（防 DNS 重绑定），可恢复 `allowedDevOrigins` 并写入
 * 你实际在地址栏使用的 hostname（不要用端口）。误配会导致 CSS/JS 403，页面像「完全没样式」。
 * 也可用环境变量：`ALLOWED_DEV_ORIGINS=host1,host2`
 */
const nextConfig: NextConfig = {};

export default nextConfig;
