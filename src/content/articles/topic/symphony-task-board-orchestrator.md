---
title: "OpenAI Symphony：把任务看板变成 Coding Agent 调度层"
description: "解析 Symphony 的 issue 驱动编排：每任务隔离工作区、仓库内工作流契约、重试与状态同步，以及人工审核边界。"
publishedAt: "2026-05-18"
kind: "topic"
slug: "symphony-task-board-orchestrator"
tags: ["Symphony", "Coding Agent", "任务编排", "Codex"]
featured: false
draft: false
readingMinutes: 8
---

当团队并行运行多个 Coding Agent，最先出现的瓶颈往往不是模型速度，而是人的注意力：哪个任务正在执行、哪个失败后重试、哪个已经有 PR、哪个正等人工审核？

OpenAI 开源的 Symphony 把管理单位从聊天会话换成 issue。它持续读取任务跟踪器，为符合条件的 issue 创建隔离工作区，在其中启动 Codex 会话，并把重试、停止和交接纳入统一的调度状态。

Symphony 不是一个让多个 Agent 彼此讨论的“多智能体协作框架”。官方规范把它定义为 scheduler/runner 和 tracker reader：每个任务可以有独立的 Agent 运行，但工单写回、PR 操作和团队规则主要由仓库里的工作流与 Agent 工具完成。

## Issue，而不是窗口

交互式用法通常从“打开一个 Agent 窗口”开始。任务一多，会话就成了脆弱的管理单位：它不天然携带优先级、阻塞关系、验收标准和团队状态。

Symphony 的规范以 issue 为主语。调度器按固定周期读取符合条件的任务，以受限并发派发；任务状态变化后，系统会决定继续、停止、释放或稍后重试。成功运行也不必直接进入 Done，可以停在团队定义的 Human Review 等交接状态。

这使人的角色从盯住每段输出，转为定义任务、处理异常、审核证据和批准关键动作。

## 每个任务一个隔离工作区

Symphony 为每个 issue 建立确定性的独立 workspace，并在其中启动 coding-agent session。工作区可以跨多次运行保留，终态任务则按策略清理。

隔离解决的是并行执行最基础的问题：两个 Agent 不应在同一目录争抢未提交文件。它并不等同于强安全沙箱。官方规范明确不强制统一的批准或沙箱策略，部署方必须自行说明信任模型，并依赖宿主系统与 Agent 运行时提供实际隔离。

## `WORKFLOW.md` 是仓库内契约

每个项目用版本控制中的 `WORKFLOW.md` 描述运行策略。YAML frontmatter 配置 tracker、轮询、工作区、hooks 与 Agent 参数，正文则成为任务提示模板。

这种设计把“Agent 应该怎么工作”与代码一起评审和演进。团队可以在契约里规定：

- 哪些 issue 状态允许派发；
- 开工前如何准备仓库；
- 必须运行哪些测试和验证；
- 如何处理 review 反馈与阻塞；
- 何时进入人工审核，何时允许合并。

规范还要求动态重载工作流，并为暂时性错误提供指数退避。调度系统真正有价值的部分，正是这些看似普通的生命周期细节。

## “完成”必须附带证据

参考工作流要求 Agent 在交接前重新检查 acceptance criteria、运行作用域内验证，并把结果写入持续更新的 workpad。涉及应用界面的改动还可附截图或录屏，PR 和 issue 之间也要建立可追踪链接。

普通团队可以把证据包缩小为五项：变更摘要、测试命令与结果、验收标准对照、未解决风险、PR 或产物链接。没有证据的“完成了”不应触发合并或发布。

## 当前边界与落地顺序

OpenAI 最初将 Symphony 描述为面向可信环境的工程预览；当前仓库规范仍是 Draft v1，而且 Linear 是该版本规定的 tracker 集成。规范本身也明确不提供通用工作流引擎、丰富多租户控制面或强制安全策略。

OpenAI 的发布文章称，部分内部团队采用类似工作方式后，在前三周看到 landed PR 数量大幅增长。这个数字是厂商内部案例，缺少公开对照设计，不应当作引入编排器后的通用产能承诺。

较稳妥的落地顺序是：

1. 先统一 issue 状态与验收标准；
2. 为每个任务使用独立 worktree 或 workspace；
3. 固化测试与证据包；
4. 只自动派发低风险、小范围任务；
5. 增加超时、重试、停止和人工审核状态；
6. 最后才扩大并发和自动合并权限。

Symphony 最重要的启发不是“同时开更多 Agent”，而是把任务、状态、工作区、证据和人工门禁组合成可运行的控制循环。Agent 越快，团队越需要这种可追踪、可停止、可恢复的工作系统。

## 参考资料

- [OpenAI：An open source specification for Codex orchestration](https://openai.com/index/open-source-codex-orchestration-symphony/)
- [OpenAI Symphony 官方仓库](https://github.com/openai/symphony)
- [Symphony Service Specification](https://github.com/openai/symphony/blob/main/SPEC.md)
- [Elixir 参考实现的 WORKFLOW.md](https://github.com/openai/symphony/blob/main/elixir/WORKFLOW.md)

> 资料复核日期：2026-08-23。本文将官方内部产能数字视为案例口径，不作为独立评测；Symphony 的安全性取决于具体实现、Agent 运行时和宿主环境。
