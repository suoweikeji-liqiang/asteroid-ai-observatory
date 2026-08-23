---
title: "AI 记忆系统分层评测：Mem0、Zep/Graphiti 与 Letta 怎么选"
description: "从记忆纵深、召回、写回治理、可迁移性和工程成熟度出发，对主流 Agent 记忆引擎做一份有边界的分层评测。"
publishedAt: "2026-07-04"
kind: "topic"
slug: "tier-review-ep04-ai-memory"
tags: ["AI记忆", "Mem0", "Zep", "MemGPT", "状态管理"]
featured: false
draft: false
readingMinutes: 8
---

给聊天记录做向量检索，不等于让 Agent 拥有记忆。真正的记忆系统至少要回答四个问题：什么值得写入，旧事实如何更新，冲突如何处理，任务需要时怎样取回。

本文基于官方文档、开源仓库和历史研究资料做架构型比较，并非同一模型、同一数据集上的统一跑分。Tier 代表编辑部对特定工程场景的主观推荐，不是客观名次。厂商自己发布的 benchmark 只能作为线索，不能直接横向拼表。

## 评价维度与总览

我们看六项：记忆纵深、检索召回、写回与遗忘治理、可控与可迁移性、生产就绪度、生态集成。

| Tier | 引擎 | 核心取向 |
|---|---|---|
| S | Zep / Graphiti | 用时间图谱处理事实变化、关系与来源 |
| A | Mem0、Letta | 分别偏通用外挂记忆层、状态化 Agent 运行时 |
| B | TencentDB Agent Memory、LangMem、Supermemory | 分别偏本地分层记忆、可组合原语、托管上下文层 |
| C | Memobase | 聚焦用户画像和事件，范围较窄但边界清楚 |

Tier 越高不等于部署越轻。许多应用只需要可靠的用户画像，没必要为时态知识图谱买单。

## S Tier：Zep / Graphiti

Graphiti 是 Zep 的开源时态上下文图引擎。它把实体、关系、事实有效期和原始 episode 连接起来，保留“现在什么是真的”和“过去什么曾经是真的”。这使事实更新不必简单覆盖旧值，也更容易追溯来源。

这种双时间与来源模型对客户关系、组织知识和持续变化的项目状态很有价值。Graphiti 支持语义、关键词与图遍历结合的混合检索；托管的 Zep 则承担规模化上下文组装和治理。

成本是图模型、抽取质量和基础设施复杂度。开源 Graphiti 与托管 Zep 不是同一个交付物，采购或自托管时必须分开评估。若记忆主要是几条稳定偏好，它会显得过重。

## A Tier：两个方向的成熟候选

### Mem0：通用外挂记忆层

Mem0 把记忆抽取、更新、搜索与实体范围封装成 API，SDK 和集成生态较完整，适合给现有 Agent 增加长期记忆，而不重写整个运行时。当前平台的 Graph Memory 会将实体连接加入向量、关键词与图信号的组合排序。

选择时要分清开源项目、托管平台和不同语言 SDK 的功能边界。某项能力出现在平台文档中，不代表自托管版本自动拥有同样实现。对多数想快速上线个性化记忆的团队，它仍是优先概念验证对象。

### Letta：记忆原生的 Agent 运行时

Letta 是 MemGPT 的延续，目标不是给任意 Agent 加一个数据库，而是提供状态化 Agent 平台。Agent 能读写自己的记忆，当前实现还提供 git 支撑的记忆文件系统与后台整理机制。

如果从零构建一个长期运行、需要自我整理上下文的 Agent，Letta 的抽象很有吸引力；如果已有成熟编排框架，只想外挂记忆 API，迁移到完整运行时的成本可能过高。它的“重”来自产品边界，而不是简单缺点。

## B Tier：各有明确专长

### TencentDB Agent Memory：本地、分层、可追溯

腾讯开源的 TencentDB Agent Memory 把短期工具轨迹压缩为可展开的结构，同时用分层管线保存长期记忆，并保留回到原始证据的路径。官方仓库强调完全本地运行和不依赖外部 API，这对敏感环境很有吸引力。

它目前仍是较新的项目。官方公布的 token 节省与成功率提升来自其设定下的评测，不能直接外推到所有 Agent；采用前应在自己的工具轨迹和模型上复现。

### LangMem：适合自己组装

LangMem 提供热路径记忆工具、后台抽取与整合管理器，并原生接入 LangGraph 的长期存储。它更像一组可组合原语，而不是带完整运维面的独立记忆服务。

对已经使用 LangGraph、希望精确控制写入与存储的团队，这是优势；对希望开箱即用的人，存储、策略、评估与治理仍需自己完成。

### Supermemory：记忆与 RAG 的一体化服务

Supermemory 同时覆盖事实抽取、用户画像、知识更新、混合搜索、连接器和文件处理，适合希望用一个 API 获得完整上下文层的团队。其开源仓库和托管 API 都值得评估。

一体化会带来便利，也会扩大供应商边界。评估时应确认数据驻留、导出、删除、连接器权限以及自托管与云端功能是否一致。官方宣称的基准领先应回到公开评测脚本和自身数据验证。

## C Tier：Memobase 的窄而清晰

Memobase 明确面向“用户而非 Agent”的记忆，围绕可配置用户画像和事件记录工作。它适合角色扮演、个人助手、用户偏好与行为分析等场景，部署栈也相对传统。

它没有必要假装覆盖所有情节记忆、程序记忆或复杂图推理。若问题就是“稳定维护一份可控用户画像”，较窄的系统可能比通用记忆平台更可靠；若需要跨任务因果与关系推理，则应看更高层的方案。

## 不要混淆 Agent 记忆与第二大脑

Khoj、Basic Memory 等产品主要帮人保存、搜索和组织资料；Agent 记忆引擎则为运行中的软件代理维护状态。两者可以连接，但验收标准不同：前者看资料可读性与个人工作流，后者看写回准确率、冲突、时效、隔离和可观测性。

## 一个更可靠的选择方法

先写出必须记住的事实类型，再构造“新增—冲突—过期—删除—跨会话召回”测试集。除回答正确率外，还要记录错误写入率、旧事实残留、检索延迟、每次更新成本，以及用户能否查看和删除自己的记忆。

- 需要事实随时间变化、关系推理和来源追踪：验证 Graphiti / Zep。
- 给既有 Agent 快速增加通用长期记忆：验证 Mem0。
- 从零构建长期状态化 Agent：验证 Letta。
- 本地敏感环境与工具轨迹压缩：验证 TencentDB Agent Memory。
- 只需可控用户画像：Memobase 可能已经足够。

## 参考资料与延伸阅读

- [Graphiti 官方仓库](https://github.com/getzep/graphiti)
- [Zep / Graphiti 架构论文](https://arxiv.org/abs/2501.13956)
- [Mem0 官方仓库](https://github.com/mem0ai/mem0)
- [Mem0 Graph Memory 文档](https://docs.mem0.ai/platform/features/graph-memory)
- [Letta 官方仓库](https://github.com/letta-ai/letta)
- [TencentDB Agent Memory 官方仓库](https://github.com/Tencent/TencentDB-Agent-Memory)
- [LangMem 官方仓库](https://github.com/langchain-ai/langmem)
- [Supermemory 官方仓库](https://github.com/supermemoryai/supermemory)
- [Memobase 官方仓库](https://github.com/memodb-io/memobase)
- [Khoj 官方仓库](https://github.com/khoj-ai/khoj)
- [Basic Memory 官方仓库](https://github.com/basicmachines-co/basic-memory)

> 资料核验日期：2026-08-23。本文 Tier 与评分均为编辑部主观判断；功能、许可证和托管边界以官方最新说明为准。
