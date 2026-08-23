---
title: "桌面 Agent 怎么选：知识工作、开发编排与本地可控的三条路线"
description: "桌面 Agent 不是一张统一榜单。本文按知识工作、开发编排、跨端协作与本地可控四类场景，梳理 Claude Cowork、Codex App、Google Antigravity 2.0 与 TRAE Work。"
publishedAt: "2026-07-05"
updatedAt: "2026-08-23"
kind: "topic"
slug: "tier-review-ep05-desktop-agent-apps"
eyebrow: "Tier Review · 桌面 Agent"
tags: ["Desktop-Agent", "AI-工具", "选型指南"]
video:
  bilibili: "https://www.bilibili.com/video/BV1bmTb6EEeY/"
featured: false
draft: false
readingMinutes: 8
---

> 编辑部结论：先按工作对象选产品，再比较模型。处理文档和跨应用任务，优先看 Claude Cowork；管理多个编码任务，优先看 Codex App；希望把 Agent 从 IDE 中独立出来，可看 Google Antigravity 2.0；需要桌面、网页与移动端衔接，可评估 TRAE Work。

## 先说明口径

这不是统一 benchmark，也不是永久排名。四款产品的目标用户、运行环境和授权方式不同，本文依据官方文档、产品边界以及编辑部对典型工作流的主观判断分层。价格、额度和地区可用性变化很快，本文不以它们打星或排位。

| 场景层 | 优先评估 | 为什么进入候选 | 先核对什么 |
|---|---|---|---|
| 知识工作与电脑操作 | Claude Cowork | 可连接本地文件、浏览器和电脑，支持长任务与并行工作流 | 组织策略、文件授权、删除确认 |
| 多编码任务编排 | Codex App | 多线程、并行 Agent、worktree 隔离、diff 审查和 Skills 形成完整闭环 | 仓库权限、沙箱规则、审查责任 |
| Agent-first 独立桌面 | Google Antigravity 2.0 | 与 IDE 解耦，支持异步任务、动态子 Agent、定时任务和 JSON hooks | 企业接入、数据边界、与现有 IDE 的分工 |
| 跨端一体化工作 | TRAE Work | 官方提供 Desktop、Web、Mobile 入口，并强调 Agents、Tools、Skills、MCP | 实际支持的平台、团队治理与导出能力 |

## 四类产品，不是四个同义词

### Claude Cowork：把“会聊天”推进到“能交付文件”

Cowork 更适合研究整理、表格、演示文稿、文件组织和浏览器协作。它的关键价值不是回答一次问题，而是让用户在任务执行中查看进度、纠偏并验收产物。涉及本地文件或电脑操作时，仍要把授权目录收窄，并在交付前检查引用、公式和覆盖写入。

### Codex App：为开发者管理并行任务

Codex App 的中心对象是项目和任务线程。官方明确提供 worktree 隔离、变更审查、Skills 与 Automations，适合把修复、测试、文档和代码审查拆成并行队列。它不能替代代码所有者：合并前仍应跑测试、检查依赖与安全边界。

### Google Antigravity 2.0：把 Agent 从 IDE 中拆出来

Antigravity 2.0 是独立桌面应用，而不是 IDE 的一个侧栏。异步任务、动态子 Agent 和 hooks 更适合已经有成熟开发环境、只想增加一层 Agent 调度面的团队。选型时要先画清楚它与 IDE、CLI、云端服务分别保存哪些上下文。

### TRAE Work：先验证跨端闭环

TRAE 官网把 Desktop、Web、Mobile 和 MCP 等能力放在同一产品入口。它适合希望减少终端切换、从多设备继续任务的用户，但采购前应以实际账号逐项验证：文件是否可回收、权限能否分级、日志能否审计，而不是只看功能清单。

## 一套更耐用的选择方法

用同一个真实任务试跑三轮：首轮生成，第二轮加入约束，第三轮要求修改既有产物。记录任务是否可恢复、权限提示是否清楚、失败后能否回滚、产物能否离开平台继续维护。对桌面 Agent 来说，可控性通常比第一次演示的完成速度更重要。

## 一手资料

- [Claude Cowork 使用说明](https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork)
- [OpenAI：Introducing the Codex app](https://openai.com/index/introducing-the-codex-app/)
- [Google：Introducing Google Antigravity 2.0](https://antigravity.google/blog/introducing-google-antigravity-2?hl=en)
- [TRAE 官方网站](https://www.trae.ai/)

> 信息核验截至 2026-08-23。产品能力、平台支持、套餐和地区可用性可能调整，请在采购或迁移前复核官方页面与组织后台。
