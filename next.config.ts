import type { NextConfig } from "next";

/**
 * 开发环境如需限制可加载 `/_next/*` 的来源（防 DNS 重绑定），可恢复 `allowedDevOrigins` 并写入
 * 你实际在地址栏使用的 hostname（不要用端口）。误配会导致 CSS/JS 403，页面像「完全没样式」。
 * 也可用环境变量：`ALLOWED_DEV_ORIGINS=host1,host2`
 */
const nextConfig: NextConfig = {
  async redirects() {
    const articleLegacyRedirects = [
      { source: "/articles/:slug", destination: "/en/knowledge-center/:slug", permanent: true },
      { source: "/en/articles/:slug", destination: "/en/knowledge-center/:slug", permanent: true },
      { source: "/zh/articles/:slug", destination: "/zh/knowledge-center/:slug", permanent: true },
      { source: "/knowledge-center/articles/:slug", destination: "/en/knowledge-center/:slug", permanent: true },
      { source: "/en/knowledge-center/articles/:slug", destination: "/en/knowledge-center/:slug", permanent: true },
      { source: "/zh/knowledge-center/articles/:slug", destination: "/zh/knowledge-center/:slug", permanent: true },
    ];

    const categoryLegacyRedirects = [
      {
        source: "/knowledge-center",
        has: [{ type: "query", key: "category", value: "news" }],
        destination: "/en/knowledge-center/news",
        permanent: true,
      },
      {
        source: "/knowledge-center",
        has: [{ type: "query", key: "category", value: "articles" }],
        destination: "/en/knowledge-center/technical-articles",
        permanent: true,
      },
      {
        source: "/:locale(en|zh)/knowledge-center",
        has: [{ type: "query", key: "category", value: "news" }],
        destination: "/:locale/knowledge-center/news",
        permanent: true,
      },
      {
        source: "/:locale(en|zh)/knowledge-center",
        has: [{ type: "query", key: "category", value: "articles" }],
        destination: "/:locale/knowledge-center/technical-articles",
        permanent: true,
      },
    ];

    return [
      {
        source: "/",
        destination: "/en",
        permanent: true,
      },
      ...articleLegacyRedirects,
      ...categoryLegacyRedirects,
    ];
  },
};

export default nextConfig;
