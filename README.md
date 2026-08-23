# 小行星 AI 观测站

面向周报、专题深解读和日报的静态内容站。源码由 Astro 构建，全文搜索由 Pagefind 在构建后生成。

## 本地运行

```bash
npm install
npm run dev
```

生产构建：

```bash
PUBLIC_SITE_URL=https://your-domain.example npm run build
```

构建产物位于 `dist/`。

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

## Cloudflare Workers Static Assets

- Project name：`asteroid-ai-observatory`
- Root directory：留空（仓库根目录）
- Build command：`npm run build`
- Deploy command：`npx wrangler deploy`
- Environment variable：`PUBLIC_SITE_URL=https://你的正式域名`
- Node.js：建议使用当前 LTS

`wrangler.jsonc` 已将 `dist/` 声明为纯静态资源目录，不需要 Worker 后端代码。项目连接 GitHub 后，生产分支建议设为 `main`；域名在 Worker 的 Settings / Domains & Routes 中绑定。
