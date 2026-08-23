---
title: "Harness 工程：模型之外，智能体如何可靠执行"
description: "上下文、工具、状态、权限、验证、追踪与恢复共同组成智能体运行外壳；本文给出可落地的设计与评测原则。"
publishedAt: "2026-05-31"
kind: "topic"
slug: "harness-engineering-principles"
tags: ["Harness工程", "智能体架构", "可观测性", "安全护栏"]
featured: false
draft: false
readingMinutes: 9
---
同一个基础模型接入不同的工具、上下文和执行循环，可能表现得像两个不同系统。原因是智能体并非只有模型：围绕模型管理输入、动作和反馈的运行层，同样决定结果。业界常把这层系统称为 agent harness。

Harness Engineering 可以理解为：把模型放进一套可执行、可观察、可约束、可验证和可恢复的工作系统。它不是一个统一标准，也不是某个框架的专属模块，而是一组架构职责。

## 一个 harness 至少管理七类问题

1. **指令**：目标、角色、边界和输出契约是什么。
2. **上下文**：本轮应提供哪些资料、历史和工具结果。
3. **工具**：调用参数如何校验，错误怎样返回，副作用是否幂等。
4. **状态**：计划、工作区和进度如何持久化、暂停与恢复。
5. **编排**：任务由确定性流程、单个 agent 还是多个角色完成。
6. **权限**：哪些动作可自动执行，哪些必须审批或拒绝。
7. **观测与验证**：轨迹、成本和产物怎样记录，什么证据代表完成。

OpenAI Agents SDK 的公开文档把工具、handoff、session、guardrail、人工审批和 tracing 都作为运行层能力；Anthropic 的工程文章则建议从简单、可组合的模式开始，只在确有收益时增加复杂性。两者实现不同，但都说明可靠执行不能只靠系统提示词。

## 把环境反馈接回循环

智能体与普通文本生成的重要差别，是动作会改变外部状态。可靠循环应遵循“观察—行动—验证”：

- 工具返回结构化成功或失败，不让模型从模糊文本猜测；
- 文件修改后读取最终 diff，而非只相信编辑工具回执；
- 声称测试通过时附实际命令、退出码和输出摘要；
- 高影响动作在执行前进入策略或人工审批；
- 重试需要上限、退避和幂等键；
- 超时、进程崩溃或人工暂停后，可以从检查点恢复。

验证器应尽可能独立于生成者。确定性任务优先使用测试、schema、静态检查和业务规则；主观任务可以使用 rubric 与人工复核。另一个模型的评分可以补充信号，但不能自动变成事实裁判。

## 复杂度是一项需要证明的成本

多智能体、细粒度任务分解和长记忆并不天然更好。每增加一个组件，就增加延迟、token、状态同步、权限面和故障模式。更强的新模型还可能让旧的脚手架从帮助变成干扰。

Anthropic 的长程应用实验采用 planner、generator 和 evaluator，并在后续版本中逐项删除不再必要的结构。这提供了一个有用原则：harness 中每个模块都编码了“模型自己做不好什么”的假设；模型或任务变化后，应重新做消融验证。

Harness-Bench 预印本在 106 个沙箱任务与共享预算下比较 model–harness 配置，观察到完成率、过程质量和效率存在差异。它支持“应报告模型与 harness 组合”的研究方向，但仍是 2026 年的新基准，任务覆盖和外部复现需要继续检验。

## 面向生产的最小闭环

普通团队可以从一个小闭环开始：

1. 选择输出可验证、权限较低的任务。
2. 固定模型、harness、工具与环境版本。
3. 为任务定义输入、产物、停止条件和失败预算。
4. 只授予完成该任务所需的工具与数据。
5. 保存计划、关键决策、工具轨迹和最终产物。
6. 由测试或独立审核判断是否完成。
7. 将生产失败转成回归案例，再决定是否增加模块。

评估时不要只报“哪个模型”。至少同时报告 harness 版本、上下文来源、工具与权限、预算、重试策略、验证器和人工介入。这些变量不固定，分数就难以解释。

Harness 工程的目标不是把模型包得越厚，而是让每一次自主性都有边界、每一个完成声明都有证据、每一种失败都有可恢复路径。

## 参考资料与延伸阅读

- [Anthropic：Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Anthropic：Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- [OpenAI Agents SDK：Agents](https://openai.github.io/openai-agents-python/agents/)
- [OpenAI Agents SDK：Human-in-the-loop](https://openai.github.io/openai-agents-python/human_in_the_loop/)
- [OpenAI Agents SDK：Guardrails](https://openai.github.io/openai-agents-python/guardrails/)
- [Harness-Bench 论文（arXiv 预印本）](https://arxiv.org/abs/2605.27922)

> 资料核验日期：2026-08-23。
