import type { NextConfig } from "next";

/**
 * Next.js 15：一旦配置了 `allowedDevOrigins`，对 `/_next/static/*`（含全局 CSS）会走更严格的来源校验。
 * 若用 `127.0.0.1` 打开、或本机局域网 IP 变更，未在名单里会导致样式表 403，页面会像「样式全丢、链接变蓝」。
 * 额外来源可用环境变量 `ALLOWED_DEV_ORIGINS`（逗号/空格分隔，只写 hostname，不要端口）。
 */
const envDevOrigins =
  process.env.ALLOWED_DEV_ORIGINS?.split(/[\s,]+/).map((s) => s.trim().toLowerCase()).filter(Boolean) ?? [];
const hostAliases = [process.env.COMPUTERNAME, process.env.HOSTNAME]
  .map((s) => (typeof s === "string" ? s.trim().toLowerCase() : ""))
  .filter(Boolean);

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "::1",
    "192.168.20.66",
    "192.168.1.154",
    ...hostAliases,
    ...envDevOrigins,
  ],
};

export default nextConfig;
