---
title: "先审尺子，再量模型：智能体评测为何会失真"
description: "从 SWE-Bench Pro 坏题审计出发，拆解题面、测试覆盖、数据污染、任务分布和运行环境如何扭曲编码智能体评测。"
publishedAt: "2026-07-19"
kind: "topic"
slug: "broken-benchmarks-evaluation-crisis"
tags: ["AI评测", "编码智能体", "Benchmark", "评测工程"]
featured: false
draft: false
readingMinutes: 9
---
排行榜把复杂能力压成一个数字，便于比较，也容易制造过度确定感。2026 年 7 月，OpenAI 审计 SWE-Bench Pro 后估计约 30% 的任务存在会破坏评测信号的问题，并撤回此前采用该基准的建议。这不是“所有榜单都有三成坏题”，而是一次具体审计揭示了通用风险：模型可能没有变，尺子却已经弯了。

## 一道题可以怎样判错

OpenAI 对 731 个公开任务先做自动筛查，再采用智能体辅助审计与有经验工程师的人工复核。自动路径将 200 题标为破损，占 27.4%；人工路径标出 249 题，占 34.1%。问题主要分为四类：

- 测试强制题面未要求的具体实现，使功能正确的方案失败；
- 题面漏掉隐藏测试才要求的条件；
- 测试覆盖不足，让不完整修复通过；
- 题面误导求解方向，甚至与测试矛盾。

坏题既会制造假失败，也会制造假成功。更麻烦的是，真实 GitHub issue、补丁和测试原本属于长期协作过程；把它们切成独立试题时，评论、评审和隐含约定可能丢失。公开仓库与补丁还可能出现在训练数据中，形成污染风险。

## 干净的公开题也未必代表你的工作

即使题目没有缺陷，公开基准测量的任务分布也可能与企业场景不同。私有 SDK、内部认证库、团队规范、工作区插件、指令文件和跨仓库依赖，通常不在公开题库里。

Microsoft 的 Agent Experience 系列因此建议把公开基准当作能力初筛，而不是采购结论。高分说明模型在特定任务和基准 harness 中表现好，并不能自动预测它在另一套代码、工具和规范中的效果。

## 评测对象其实是 model–harness–environment

编码智能体会读取操作系统、shell、路径、语言服务器诊断、工具描述和工作区状态。Microsoft 的实验记录表明，这些环境变量会改变执行轨迹：Windows 与 Linux 的 shell 不同，语言服务器是否反馈错误也会影响修正时机，带语义暗示的用户或目录名甚至会引导技术选择。

因此，比较两个模型时至少要固定并记录：

- 模型与推理配置；
- agent/harness 版本及系统指令；
- 操作系统、shell、语言运行时和 LSP；
- 工具、网络、权限、预算与超时；
- 仓库快照、依赖和工作目录；
- 评分器、测试和 rubric 版本。

单次运行还会受到采样和工具故障影响。重复次数应依据方差与决策风险设计，而不是机械套用一个数字；Microsoft 文中的“五次起步”是工程经验，不是统计学上适用于所有任务的保证。

## 三层评测比一个总分更有用

第一层是公开基准，用来观察基础能力和明显回退。报告结果时必须带上数据集版本、harness、预算和日期。

第二层是内部真实任务。选择日常高价值工作，使用隔离的仓库快照和保留测试，覆盖功能正确性、代码质量、安全、成本与人工修正。任务不能把标准答案留在 Git 历史、构建缓存或可读取的评分器中。

第三层是生产反馈。观察补丁接受率、返工、回滚、逃逸缺陷、完成时间和人工审查成本，并把新失败沉淀回评测集。离线高分若不能转化为生产结果，就应重新检查任务分布与评分标准。

## 评测也需要自己的质量门

一套可信评测应回答：

1. 题面是否包含完成任务所必需的要求？
2. 测试是否允许多种功能正确的实现？
3. 测试是否覆盖了关键失败方向？
4. 智能体是否可能看到参考补丁或隐藏标准？
5. 评分器与人工判断是否经过校准？
6. 多次运行的方差是否足以支持结论？
7. 环境变化是否被版本化并可复现？

排行榜仍有用，但只能回答它实际测过的问题。选型时更稳妥的原则是：公开榜单负责缩小候选范围，固定环境中的真实任务负责决定，生产反馈负责持续纠偏。

## 参考资料与延伸阅读

- [OpenAI：Separating signal from noise in coding evaluations](https://openai.com/index/separating-signal-from-noise-coding-evaluations/)
- [Microsoft：What AI benchmarks are not telling you](https://developer.microsoft.com/blog/what-ai-benchmarks-are-not-telling-you/)
- [Microsoft：The hidden variables in your agent eval](https://developer.microsoft.com/blog/the-hidden-variables-in-your-agent-eval/)
- [Microsoft：Building AX evals that actually work](https://developer.microsoft.com/blog/building-ax-evals-that-actually-work)
- [Anthropic：Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)

> 资料核验日期：2026-08-23。
