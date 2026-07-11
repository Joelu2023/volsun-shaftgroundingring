# Auto Publish System v2 + Content Growth Engine v4

Word 拖入 → 自动 SEO 文章 → 自动发布 → 收录追踪 → 表现分析 → 优化回流。

## Search Behavior Driven Content System（v4）

系统升级目标：

```text
Google Behavior → Content Strategy → Content Production
```

### System Architecture

```mermaid
flowchart TD
    subgraph googleBehavior [GoogleBehavior]
        gscClient[GscClient]
        keywordIntel[KeywordIntelligenceEngine]
        indexTracker[IndexTracker]
        performanceTracker[PerformanceTracker]
        crawlSimulator[CrawlBehaviorSimulator]
    end

    subgraph strategyLayer [ContentStrategy]
        gapDetector[ContentGapDetector]
        optimizationEngine[ContentOptimizationEngine]
        feedbackEngine[ContentFeedbackEngine]
        scoringEngine[ScoringEngine]
    end

    subgraph productionLayer [ContentProduction]
        watcher[Watcher]
        pipeline[Pipeline]
        builder[Builder]
        governance[Governance]
        publisher[Publisher]
    end

    gscClient --> keywordIntel
    gscClient --> indexTracker
    gscClient --> performanceTracker
    indexTracker --> crawlSimulator
    performanceTracker --> keywordIntel
    performanceTracker --> gapDetector
    keywordIntel --> gapDetector
    gapDetector --> optimizationEngine
    optimizationEngine --> feedbackEngine
    crawlSimulator --> feedbackEngine
    scoringEngine --> feedbackEngine
    feedbackEngine --> publisher
    publisher --> watcher
```

### Data Flow

```mermaid
flowchart LR
    queries[GSCQueries] --> keywordIntel[KeywordIntel]
    pages[GSCPages] --> performance[PerformanceTracker]
    sitemap[SitemapUrls] --> indexTrack[IndexTracker]
    keywordIntel --> gaps[ContentGapDetector]
    performance --> gaps
    indexTrack --> feedback[ContentFeedbackEngine]
    performance --> feedback
    feedback --> scoreAdjust[dynamicScoreAdjustment]
    gaps --> optimize[ContentOptimizationEngine]
    feedback --> crawlSim[CrawlBehaviorSimulator]
    optimize --> contentIdeas[ContentIdeas]
    crawlSim --> crawlMap[CrawlPriorityMap]
    contentIdeas --> inbox[content/inbox]
```

### v4 模块列表

| 模块 | 文件 | 职责 |
|------|------|------|
| Keyword Intelligence Engine | `keyword-intelligence-engine.ts` | 从 GSC queries 提取 high opportunity、rising queries、low CTR high impression keywords |
| Content Gap Detector | `content-gap-detector.ts` | 检测无对应文章关键词、无排名页面、低 CTR 页面 |
| Content Optimization Engine | `content-optimization-engine.ts` | 生成 title/meta rewrite、internal link boost、section reorder 建议 |
| Crawl Behavior Simulator | `crawl-behavior-simulator.ts` | 模拟 crawl frequency、revisit probability、freshness decay，输出 crawl priority map |
| Feedback Engine | `content-feedback-engine.ts` | 生成 `ArticleReport`、建议项、反馈回流 |
| Scoring Engine | `scoring-engine.ts` | 基础 score + 动态分数调整 |

### v4 报告输出

`factory:report` 现在会输出：

- `pages: ArticleReport[]`
- `keywordIntelligence`
- `contentGaps`
- `optimizationSuggestions`
- `crawlPriorityMap`
- `actionQueue`
- `contentPlanner`
- `contentIdeas`

## Governance Layer（Dual Track + Scoring）

发布前运行 Quality Gate，并在轨道解析后计算内容分数（0–100）：

| PublishMode | 适用 | 行为 |
|-------------|------|------|
| `crawl_feed` | news · technical-articles | **不断流** — 输出 warnings，按 score 决定 crawl 强度 |
| `seo_strict` | product · faq | **高质量控制** — 仍走 score 决策，但更强调诊断项 |

```
Content Factory → Governance (Dual Track + Scoring) → Publish
                      │
         mode = resolvePublishMode(category)
                      │
         score = calculateScore(article)
                      │
     ┌────────────────┼────────────────┐
     ▼                ▼                ▼
  >=85 publish     70–84 publish     50–69 publish
  top tier         standard tier     low crawl priority
                      │
                      ▼
                  <50 block
```

### Score 规则（100 分）

| 维度 | 分值 |
|------|------|
| SEO 完整性 | 25 |
| 内容质量 | 25 |
| 内链密度 | 15 |
| 图片完整度 | 10 |
| 关键词匹配 | 15 |
| 重复风险 | 10 |

**硬阻断（两轨均 block）：** slug 重复 · 正文为空 · 总分 < 50  
**Sitemap priority：** 文章详情页 = `score / 100`

紧急绕过：`--skip-governance` · 允许 ZH-TODO：`--allow-todo`

## Auto Publish v2 架构（Word 拖入自动发布）

```
content/inbox/
   article.docx  +  images/
        │
        ▼  File Watcher (watcher.ts)  — 检测 .docx，2s 防抖
        │
        ▼  Pipeline (pipeline.ts)
   ┌────┴────┬─────────┬──────────┬───────────┐
   │         │         │          │           │
docx-parser seo-engine image-mapper  builder   links
   │         │         │          │           │
   └────┬────┴─────────┴──────────┴───────────┘
        ▼
   publisher.ts → articles.ts → npm run build → git push → Vercel
        │
        ▼  sitemap 自动 +1（/en/knowledge-center/{slug}）
   en + zh 页面自动生成
```

**Inbox input boundary:** `content/inbox/archive/**` stores published source files and is never considered an input source for auto, watch, draft, or status processing. Only direct `.docx` files in the inbox root are eligible (`content-factory/inbox-paths.ts`).

### 一键命令

```bash
# 持续监听 inbox（推荐）
npm run factory:watch

# 单次自动发布 inbox 中的 docx
npm run factory:auto

# 预览（不写文件、不 git）
npm run factory:auto -- --dry-run --no-git
```

## 增长闭环架构

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   content/inbox/ (docx + images)          ← 新选题回流      │
│        │                                        ▲          │
│        ▼ factory:draft                          │          │
│   Content Factory（parser/seo/builder/links）    │          │
│        │                                        │          │
│        ▼ factory:publish                        │          │
│   Publish Engine（articles.ts → build → git → Vercel）      │
│        │                                        │          │
│        ▼ factory:report                         │          │
│   Index Tracker（sitemap + GSC URL Inspection）  │          │
│        │  discovered / crawled / indexed        │          │
│        ▼                                        │          │
│   Performance Tracker（GSC Search Analytics）    │          │
│        │  impressions / clicks / CTR / position │          │
│        ▼                                        │          │
│   Feedback Engine ──── 优化建议 + content ideas ─┐          │
│        │                                        │          │
│        ▼ Growth Execution Layer                 │          │
│   Action Queue + Content Planner ──────────────┘          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Content Feedback Loop

发布后的每篇文章会进入反馈系统：

```
Content → Publish → Google → Feedback → Score Update → Next Content
```

新增模块：

| 文件 | 职责 |
|------|------|
| `index-tracker.ts` | `discovered / crawled / indexed` + `indexedLatencyDays` |
| `performance-tracker.ts` | `impressions / clicks / CTR / averagePosition`，支持 GSC 与 mock |
| `content-feedback-engine.ts` | 生成 `ArticleReport`、建议项、crawl priority delta |
| `scoring-engine.ts` | `dynamicScoreAdjustment()`，基于真实表现更新分数 |

### 动态反馈规则

| 条件 | 动作 |
|------|------|
| CTR < 2% | `adjustedScore -10` |
| impressions 低 | 输出“增加内链”建议 |
| 未 indexed > 7 天 | `crawlPriorityDelta +0.1` |
| average position > 20 | 输出内容优化建议 |

### ArticleReport 输出

```ts
{
  baseScore,
  adjustedScore,
  indexStatus,
  indexedLatencyDays,
  performanceMetrics,
  recommendations,
}
```

## 生产工作流

```
content/inbox/article.docx + content/inbox/images/
        │
        ▼  npm run factory:draft
content-factory/drafts/{slug}.json   ← 审校 [ZH-TODO] 中文文案
        │
        ▼  npm run factory:publish -- {slug}
src/data/mock/articles.ts  → build 验证 → git commit + push → Vercel 自动部署
```

## 1. 投放内容

- Word 文件放入 `content/inbox/`（每次一篇，`.docx`）
- 图片放入 `content/inbox/images/`
  - 文件名含 `cover` / `booth` / `main` / `hero` 的图片优先作为封面 + OG image
  - 文件名自动规范化（小写、连字符、去重复扩展名 `.jpg.jpg`），并加 slug 前缀

## 2. 生成草稿

```bash
npm run factory:draft
# 可选参数：
npm run factory:draft -- --slug my-custom-slug --category news --title "Custom Title"
```

自动完成：

| 模块 | 文件 | 职责 |
|------|------|------|
| File Watcher | `watcher.ts` | 监听 `content/inbox`，检测 `.docx` 触发 pipeline |
| Pipeline | `pipeline.ts` | 编排 parse → seo → build → publish |
| Docx Parser | `docx-parser.ts` | H1/H2/H3、段落、列表、表格、`[IMAGE: ref]` 占位 |
| SEO Engine | `seo-engine.ts` | slug、meta title/description（150–160）、category、关键词 |
| Image Mapper | `image-mapper.ts` | 拷贝到 `public/images/{news\|articles}/{slug}/`，关键词/占位匹配插入，首张 cover=OG |
| Publisher | `publisher.ts` | 写入 `articles.ts`、build、git commit/push、归档 inbox |
| Builder | `builder.ts` | 组装 EN+ZH 双语 ArticleRecord + 内链 |
| Links | `links.ts` | 关键词触发内链 |

## 3. 中文审校（必须）

草稿中所有 `[ZH-TODO]` 前缀的文本需要替换为**专业工业中文表达（非直译）**。
推荐在 Cursor 中直接让 AI 完成：

> 请翻译 content-factory/drafts/{slug}.json 中所有 [ZH-TODO] 内容为专业工业中文

发布前若仍存在 `[ZH-TODO]`，publish 会拒绝执行（可用 `--allow-todo` 强制跳过，不推荐）。

## 4. 发布

```bash
npm run factory:publish -- {slug}
# 可选：--dry-run（预览）--no-push（只 commit）--skip-build（跳过构建）--no-git（只写文件）
```

发布动作：

1. 文章条目注入 `src/data/mock/articles.ts`（`__CONTENT_FACTORY_INSERT__` 标记处，不改动现有条目/路由）
2. `npm run build` 验证
3. `git add . && git commit && git push origin main` → Vercel 自动部署
4. inbox 源文件归档至 `content/inbox/archive/{slug}/`，草稿移至 `drafts/published/`

## sitemap

无需手动更新：`src/app/sitemap.ts` 通过 `articles` 数组自动生成，
新文章发布后自动新增 `/en/knowledge-center/{slug}` 条目（仅 EN 权重结构）。

## 增长闭环（v2.0）

### 前置：配置 GSC API

在 `.env.local` 中填入（详见 `.env.example`）：

```
GSC_CLIENT_EMAIL=xxx@yyy.iam.gserviceaccount.com
GSC_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GSC_SITE_URL=sc-domain:volsunsgr.com
```

GCP 创建 service account → 启用 Search Console API → 在 GSC 资源中把 service account 邮箱添加为用户。

### 生成增长报告

```bash
npm run factory:report
# 跳过逐 URL 收录检测（仅表现数据）：
npm run factory:report -- --skip-inspection
```

| 模块 | 职责 |
|------|------|
| `gsc-client.ts` | Service account JWT 认证 + GSC REST API（零额外依赖） |
| `index-tracker.ts` | 抓取线上 sitemap.xml（离线回退本地数据）→ URL Inspection → `discovered / crawled / indexed` |
| `performance-tracker.ts` | Search Analytics 近 28 天 `impressions / clicks / CTR / position` + Top Queries |
| `feedback-engine.ts` | 优化建议 + 回流选题（content ideas） |

### 优化规则

| 信号 | 建议 |
|------|------|
| 未收录（discovered/unknown） | 增加内链 + 提升 sitemap priority + GSC 手动请求收录 |
| 已抓取未收录（crawled） | 强化内链权重，检查内容独特性 |
| 曝光低（<30/28天） | 增加站内内链、扩充关键词覆盖 |
| CTR 低（<2%，曝光≥100） | 重写 meta title / description |
| 排名弱（>20 位） | 扩充内容深度 + 高权重页内链 |
| 高曝光零点击 query 且无对应文章 | 生成新选题 → 投入 `content/inbox` 回流生产 |

报告输出：`content-factory/reports/report-{date}.json`（`GrowthReport`：`pages: ContentReport[]` + `topQueries` + `contentIdeas`）。

## 查看状态

```bash
npm run factory -- status   # inbox / drafts / GSC 配置状态
```
