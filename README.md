# 小行星 AI 观测站

面向周报、专题深解读和日报的静态内容站。源码由 Astro 构建，全文搜索由 Pagefind 在构建后生成。

## 本地运行

```bash
npm install
npm run dev
```

生产构建：

```bash
PUBLIC_SITE_URL=https://ai.aifuli.dev npm run build
```

构建产物位于 `dist/`。

## 访问统计

Cloudflare Web Analytics 报告由 GitHub Actions 每天北京时间 09:00 自动生成，也可以在 Actions 中手动运行 `Cloudflare Analytics Report`。报告包含页面浏览量、访问量、热门页面、访问来源、国家和地区以及设备分布。

本地查询时，将只读凭据放在环境变量中（不要写入仓库）：

```bash
npm run analytics -- --hours 24
npm run analytics -- --days 7 --markdown
```

需要 `CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID`。线上凭据保存在 GitHub Actions Secrets 中。当前账户只有 `ai.aifuli.dev` 一个 Web Analytics 站点，因此报告按账户查询；如果以后增加其他统计站点，需要再加入域名筛选。

## 内容模型

文章放在 `src/content/articles/{weekly,topic,daily}/`。统一 frontmatter 包括：

- `kind`：`weekly`、`topic` 或 `daily`
- `slug`：公开 URL 中使用的稳定标识
- `title`、`description`、`publishedAt`
- `tags`、`cover`、`video`
- `issue`：周报期号等可选编号
- `featured`、`draft`、`readingMinutes`

从 `ai_daily_brief_factory_v3` 生产仓库向本站导出文章：

```bash
cd /path/to/ai_daily_brief_factory_v3
python3 scripts/export_blog_article.py \
  --source outputs/example/report.md \
  --site-dir ../asteroid-ai-observatory \
  --kind topic \
  --slug example-topic \
  --title "文章标题" \
  --description "文章摘要" \
  --published-at 2026-08-23 \
  --tag Agent \
  --tag 工程实践
```

导出命令只接收已经通过事实校对和发布审核的 Markdown。博客正文是正式发布资产，不应直接使用未经编辑的口播稿。

## 参考资料标准

文档站承担视频之外的证据归档功能：

- 关键事实、数字、版本能力和判断必须有可定位的来源。
- 优先引用官网、官方文档、源码仓库、Release/Changelog、论文原文和当事方公告。
- 周报中的每条事件都应附来源；专题文末应有“参考资料与延伸阅读”。
- 事实来源与延伸阅读分组，链接直接指向支撑页面，不用搜索结果页代替。
- 找不到原始依据的说法应降级、标明不确定性或删除，不为了数量堆弱相关链接。

## Cloudflare Workers Static Assets

- Project name：`asteroid-ai-observatory`
- Root directory：留空（仓库根目录）
- Build command：`npm run build`
- Deploy command：`npx wrangler deploy`
- Environment variable：`PUBLIC_SITE_URL=https://ai.aifuli.dev`
- Node.js：建议使用当前 LTS

`wrangler.jsonc` 已将 `dist/` 声明为纯静态资源目录，不需要 Worker 后端代码。项目连接 GitHub 后，生产分支建议设为 `main`；域名在 Worker 的 Settings / Domains & Routes 中绑定。
