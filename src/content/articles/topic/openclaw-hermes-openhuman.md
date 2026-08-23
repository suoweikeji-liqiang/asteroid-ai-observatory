---
title: "OpenClaw、Hermes Agent 与 OpenHuman：个人智能体的三种架构重心"
description: "比较三个开源个人智能体项目在入口与工具、技能学习、长期记忆上的不同重心，并说明本地优先、权限和成熟度边界。"
publishedAt: "2026-05-20"
kind: "topic"
slug: "openclaw-hermes-openhuman"
tags: ["OpenClaw", "Hermes Agent", "OpenHuman", "个人智能体"]
video:
  bilibili: "https://www.bilibili.com/video/BV1GzLx6iEaF/"
featured: false
draft: false
readingMinutes: 10
---

OpenClaw、Hermes Agent 和 OpenHuman 都在做个人智能体，但把它们理解成三个互斥品类并不准确。三者都包含模型、工具、记忆和工作流，只是产品入口与架构重心不同。

一个实用的比较方式是：OpenClaw 首先解决“智能体怎样进入日常渠道并调用工具”；Hermes Agent 更强调“执行经验怎样沉淀成可复用技能”；OpenHuman 则把“怎样建立可浏览的长期个人上下文”放在最前面。

## OpenClaw：Gateway 连接渠道与真实工具

OpenClaw 官方将其定位为运行在用户设备上的个人 AI 助手。Gateway 是本地控制平面，连接会话、工具、事件和 WhatsApp、Telegram、Slack、Discord 等消息渠道，CLI、控制界面和设备节点再接到 Gateway 上。

它适合希望助手常驻、从熟悉聊天入口触发任务，并能访问文件、浏览器或设备能力的用户。但“能动手”同时扩大了攻击面。官方安全指南明确提醒：入站消息是不可信输入；主会话工具可能直接在宿主机运行，除非用户配置沙箱；将 Gateway 暴露给不互信用户也不是其默认安全模型。

因此部署重点不是接入渠道数量，而是发送者白名单、会话隔离、工具权限、沙箱、凭据和审计。

## Hermes Agent：把成功经验做成技能

Nous Research 的 Hermes Agent 同样支持工具、Gateway、定时任务与多种入口，但其突出设计是内置学习循环和 Agent 管理的 skills。技能是按需加载的工作说明与资源，Agent 可以把完成任务的经验整理成下次可复用的流程。

这种机制适合重复但不完全相同的工作，例如项目维护、资料整理、环境配置和周期性研究。它减少“每个新会话都从零摸索”的成本，但也产生新的治理问题：自动生成的技能会改变未来行为，必须能查看、版本化、测试和撤销；来自公共技能中心的内容还要按代码依赖一样审查。

Hermes 也提供持久记忆，OpenClaw 也有 skills，所以两者不是“手”和“脑”的严格分工。更准确的区别是：OpenClaw 的入口叙事以 Gateway 和渠道为中心，Hermes 的产品叙事更突出学习闭环与技能复用。

## OpenHuman：Memory Tree 与可编辑个人知识库

OpenHuman 把邮件、聊天、文档和代码等来源规范化为带来源信息的 Markdown，再进行分块、评分、实体抽取和分层摘要。数据写入本地 SQLite，同时镜像为可在 Obsidian 中浏览和编辑的 Markdown vault。

这个设计的亮点是记忆可见：用户能检查系统保留了什么，而不是只能相信不透明的 embedding。Memory Tree 提供 source、topic 和 global 三类摘要范围，检索时可以搜索、逐层下钻或读取原始块。

“local-first”也不能误读成“所有计算和数据都永不离机”。官方架构文档说明，Memory Tree 数据库与 Markdown vault 位于本机，但默认模型调用、Web 搜索代理、OAuth 和部分工具请求会经过 OpenHuman 后端；只有启用本地模型后，一部分 embedding 与摘要工作才可在设备上完成。项目目前仍标注为 early beta。

## 按需求选择，而不是按概念切换

| 主要痛点 | 更值得先看 | 先检查什么 |
|---|---|---|
| 想从聊天渠道触发本地工具 | OpenClaw | 渠道白名单、Gateway 暴露面、宿主机权限 |
| 重复任务每次都重新摸索 | Hermes Agent | 技能生成、版本控制、安全扫描与回滚 |
| AI 总是不理解个人长期上下文 | OpenHuman | 数据连接范围、本地/云端边界、记忆纠错 |

如果只做偶发问答或一次性写作，这三套系统都可能过重。只有当常驻入口、重复执行或跨来源记忆成为稳定需求时，自托管个人 Agent 的运维和安全成本才可能值得。

三者共同指向一个趋势：个人智能体的竞争不再只有模型质量，还包括入口、状态、技能、记忆和权限。但功能越完整，信任边界越复杂。安装之前，应先画清楚数据去哪里、谁能触发任务、哪些工具能写入，以及失败后如何撤销。

## 参考资料

- [OpenClaw 官方仓库](https://github.com/openclaw/openclaw)
- [OpenClaw 安全指南](https://docs.openclaw.ai/security)
- [OpenClaw 威胁模型](https://docs.openclaw.ai/security/THREAT-MODEL-ATLAS)
- [Hermes Agent 官方仓库](https://github.com/NousResearch/hermes-agent)
- [Hermes Agent Skills 文档](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills)
- [Hermes Agent 安全文档](https://hermes-agent.nousresearch.com/docs/user-guide/security)
- [OpenHuman 官方仓库](https://github.com/tinyhumansai/openhuman)
- [OpenHuman Memory Tree 文档](https://github.com/tinyhumansai/openhuman/blob/main/gitbooks/features/obsidian-wiki/memory-tree.md)
- [OpenHuman 架构文档](https://github.com/tinyhumansai/openhuman/blob/main/gitbooks/developing/architecture/README.md)

> 资料复核日期：2026-08-23。功能和安全描述以各项目当前官方文档为准；OpenHuman 仍处早期测试阶段，三者均不应被视作零维护成本的消费级成品。
