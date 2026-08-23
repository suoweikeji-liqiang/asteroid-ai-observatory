---
title: "Agent 框架怎么选：轻量循环、类型安全、持久图与企业 Java"
description: "Agent 框架没有统一最优解。本文按 OpenAI Agents SDK、Pydantic AI、LangGraph 与 AgentScope Java 所处的工程层级，给出选型和迁移建议。"
publishedAt: "2026-07-10"
updatedAt: "2026-08-23"
kind: "topic"
slug: "tier-review-ep10-agent-frameworks"
eyebrow: "Tier Review · Agent 框架"
tags: ["Agent-Framework", "LangGraph", "Agents-SDK", "工程架构"]
video:
  bilibili: "https://www.bilibili.com/video/BV1MaNJ6DEAY/"
featured: false
draft: false
readingMinutes: 9
---

> 编辑部结论：先选择状态模型和故障恢复方式，再选择框架。简单工具循环不需要上图编排；长流程需要持久化、暂停恢复和人工介入时，才值得承担更重的运行时。

## 先说明口径

本文不做统一 benchmark。框架的抽象层、语言生态和运行时责任不同，代码行数、GitHub 热度或单次演示速度都不能代表生产适配度。以下分层是编辑部依据官方文档、可观测性、状态管理和团队语言栈作出的主观选择。

| 架构层 | 优先评估 | 适合的系统 | 主要代价 |
|---|---|---|---|
| 轻量工具循环 | OpenAI Agents SDK | 少量 Agent、handoff、guardrails 与 tracing | 对复杂业务状态需自行建模 |
| 类型安全的 Python 应用 | Pydantic AI | 已使用 Pydantic、重视结构化输入输出和测试 | 仍需自行设计持久任务编排 |
| 可恢复的状态图 | LangGraph | 长流程、暂停恢复、人工审批与 durable execution | 状态图、存储和运维复杂度更高 |
| 企业 Java 体系 | AgentScope Java | JVM 团队、既有企业中间件与治理要求 | 生态成熟度和团队学习成本需实测 |

## 从最薄的一层开始

如果任务只是“模型选择工具—执行—返回结果”，先用薄 SDK 保持调用链可读。OpenAI Agents SDK 提供 Agent、handoff、guardrails 和 tracing 等基本构件；Pydantic AI 则把 Python 类型、依赖注入与结构化验证带进 Agent 应用。两者都适合从小型服务起步，但业务状态、幂等和补偿仍是应用自己的责任。

当流程跨越多个步骤、可能运行很久、需要等待人工批准或故障后续跑时，再考虑 LangGraph 这类持久图运行时。它的价值不是“更多 Agent”，而是明确状态转移、checkpoint 和恢复语义。Java 团队则应优先评估与既有线程模型、依赖注入、监控和发布体系的融合，AgentScope Java 是这一方向的候选之一。

## 三个常见误区

第一，把多 Agent 数量当成熟度。多数任务用一个 Agent 加清晰工具更稳定。第二，把框架 tracing 当完整可观测性；生产环境还需要业务指标、成本、延迟、失败类别和审计日志。第三，让框架对象渗透整个领域层，导致未来无法替换模型或运行时。

更稳妥的做法是定义自己的模型接口、工具协议和状态 schema，把框架限制在适配层。为每个关键节点准备确定性测试，并为外部副作用设计幂等键、超时、重试与人工补偿。

## 一手资料

- [OpenAI Agents SDK 文档](https://openai.github.io/openai-agents-python/)
- [Pydantic AI：Agent 核心概念](https://pydantic.dev/docs/ai/core-concepts/agent/)
- [LangGraph 官方文档](https://langchain-ai.github.io/langgraph/)
- [AgentScope Java 官方文档](https://java.agentscope.io/)

> 信息核验截至 2026-08-23。框架 API 与兼容模型会持续变化；正式采用前请锁定版本，阅读迁移说明，并用团队自己的故障场景做恢复测试。
