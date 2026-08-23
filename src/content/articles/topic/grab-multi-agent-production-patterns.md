---
title: "Grab 数据仓库支持 Agent：从救火到可治理的多智能体工作流"
description: "拆解 Grab Analytics Data Warehouse 团队的生产案例：调查与增强分流、专职 Agent、工具收敛、上下文压缩和人工审核。"
publishedAt: "2026-06-06"
kind: "topic"
slug: "grab-multi-agent-production-patterns"
tags: ["多智能体", "数据平台", "LangGraph", "工程支持"]
video:
  bilibili: "https://www.bilibili.com/video/BV1dyJw6UEiM/"
featured: false
draft: false
readingMinutes: 8
---

Grab 的 Analytics Data Warehouse（ADW）团队面对的是一个典型的平台困境：内部用户和数据表不断增加，工程师却把大量时间花在重复答疑、SQL 排查、元数据查询和临时支持上。

Grab 官方工程博客披露，ADW 每月支持超过 1,000 名用户，管理超过 15,000 张表；团队估计约 40% 的时间消耗在这类支持工作上。为此，他们没有造一个无所不能的聊天机器人，而是把支持请求拆成两类受约束的 Agent 工作流。

这些数字与效果均来自 Grab 自述，本文没有进行独立复测。案例边界也要说清：这是 Grab 中央数据团队的 ADW 支持系统，不等于整个超级应用的所有高并发业务都由同一套多智能体架构处理。

## 第一刀：调查与增强分流

系统先把请求分成两条路径：

- **Investigation** 负责查询分析、日志检索、表结构与血缘调查、问题总结，重点是收集证据；
- **Enhancement** 负责生成 SQL 修复、代码变更或待审核的 merge request，可能改变工程资产。

这不是简单的任务分类，而是风险分级。只读调查可以拥有较宽的检索范围；写操作必须经过更严格校验和人工复核。把诊断与修改拆开后，每个 Agent 的目标更窄，也更容易定义权限、超时和成功条件。

## 第二刀：专职 Agent 加主管编排

公开架构使用 LangGraph 组织工作流，以 FastAPI 提供服务，并由 supervisor 协调分类、路由、工具调用和 Agent 间状态。请求会被交给负责上下文检索、代码搜索、日志调查或方案生成的专职 Agent。

多 Agent 在这里不是为了模拟一个“虚拟公司”，而是为了缩小每个执行单元的职责。一个 Agent 能调用的工具越少、输出契约越明确，错误就越容易定位。

## 第三刀：控制工具和返回上下文

Grab 披露，系统一度需要面对三十多个内部工具。团队随后重点精简工具描述与返回内容，只把当前任务相关的字段送回上下文，并对 SQL、元数据、日志和 Git 工作流设置受控接口。公开材料没有给出工具最终缩减到多少，因此不能把它讲成一个确定的“砍到几项”指标。

这给生产系统一个很实用的原则：工具目录不是能力陈列柜。每增加一个工具，都增加选择歧义、权限面和观测成本。先覆盖高频场景，再根据真实失败记录扩展，通常比一次暴露全部内部 API 更稳。

## 安全与上下文是生产边界

这套系统对 SQL 设置验证层，对敏感数据提供检测和缓解措施；所有会产生代码变更的增强流程都要求 human-in-the-loop review。公开文章没有提供完整安全实现，因此不能把这些描述理解为对任意数据访问或提示注入的绝对防护。

另一个难点是多步任务的上下文。Grab 使用结构化压缩与选择性检索，在 token 预算内保留当前任务所需状态。这里的重点不是“记住所有内容”，而是为每一步保留最小充分证据，并让交接内容有稳定结构。

## 如何迁移到自己的团队

一个较小的团队可以按以下顺序落地：

1. 先把工单分成只读调查和可能改动系统的增强两类；
2. 给每类请求定义输入、工具白名单、输出格式与停止条件；
3. 用少量高频工具起步，并记录选错工具与失败调用；
4. 将 SQL、代码和配置修改放入校验与人工审核门禁；
5. 对 Agent 交接使用结构化摘要，而不是把整段聊天继续传递；
6. 用解决时间、人工接管率、错误建议率和返工率共同评估，而不只统计关闭工单数。

Grab 官方称系统释放了大量工程时间，并让团队从被动救火转向平台建设。这个方向值得参考，但公开材料没有给出足够细的对照实验，不能据此推导多 Agent 一定优于单 Agent。真正可迁移的是它的工程选择：**先按风险分流，再缩窄职责；先治理工具和权限，再扩大自动化范围。**

## 参考资料

- [Grab Tech：From firefighting to building](https://engineering.grab.com/from-firefighting-to-building)
- [InfoQ 对该案例的架构摘要](https://www.infoq.com/news/2026/05/grab-multi-agent-support-system/)
- [Grab Tech：How we help Grab build and run AI agents at scale](https://engineering.grab.com/how-grab-builds-and-runs-ai-agents-at-scale)
- [LangGraph 官方文档](https://docs.langchain.com/oss/python/langgraph/overview)

> 资料复核日期：2026-08-23。规模和节省时间等数字保留为 Grab 官方案例口径，不作为独立验证或跨团队效果承诺。
