---
title: "Deep Research 技能架构：从问题拆解到证据合成"
description: "拆解深度调研 Agent 的规划、并行检索、来源核验和报告合成机制，并说明技能文件能做什么、不能保证什么。"
publishedAt: "2026-07-14"
kind: "topic"
slug: "deep-research-skill-architecture"
tags: ["Deep Research", "技能", "多智能体", "事实核查"]
video:
  bilibili: "https://www.bilibili.com/video/BV1YmKB6jEd7/"
featured: false
draft: false
readingMinutes: 8
---

普通搜索回答“有哪些页面”，深度调研要回答“证据共同支持什么、彼此冲突在哪里”。两者的差别不只是多搜几次，而是一条完整的研究管线：界定问题、拆成可独立调查的子问题、并行取证、校验来源，再把证据合成为带引用的结论。

近年一些开源项目把这套流程写成 Claude Code 的 `SKILL.md` 或命令文件。它们让普通用户能复用研究方法，但“装一个技能”并不等于获得可靠研究员。真正决定质量的仍是检索可用性、来源选择、引用对应关系和最终审阅。

## 一条深度调研管线

Anthropic 开源的 research lead agent 提示词提供了一个清晰样本。主管 Agent 不负责包办所有搜索，而是承担四项工作：

1. 判断问题属于直接查询、广度枚举还是深度分析。
2. 制订研究计划，把边界清晰的部分委派给子 Agent。
3. 比较子任务结果，发现冲突、缺口和重复。
4. 依据证据撰写最终报告，并保留引用。

这不是“多 Agent 天然更聪明”。并行的价值在于缩短独立检索的墙钟时间，并让不同视角互相补充；如果任务拆分重叠、来源同质，多个 Agent 只会更快地产生重复内容。

### 广度发散

广度型任务可以按地区、公司、产品或时间段切分。好的子任务边界应尽量互斥，并规定输出字段和来源标准。主管还需要先确认候选集合，否则容易在并行后才发现漏掉关键对象。

### 深度求证

深度型任务围绕同一问题采用不同证据路线，例如官方统计、同行评议研究、监管材料和反方论证。此时重点不是让每个 Agent 都写一篇完整报告，而是让每条路线提供可核查的证据与限制。

### 证据合成

合成不能只是拼接摘要。主管应区分事实、来源主张和研究推断，检查数字的时间与口径，处理相互矛盾的证据，并把引用放在其直接支持的句子附近。如果没有做这一步，报告再长也只是搜索结果合集。

## 两类开源技能样本

开发者 liangdabiao 的两个仓库展示了同一骨架如何封装成不同入口：

- `simple_claude_deep_research_agent` 把流程做成较轻量的 Claude Code 技能，适合快速进入问题拆解和并行调查。
- `Claude-Code-Deep-Research-main` 提供更完整的阶段化流程，强调澄清范围、研究计划、来源评级和结构化交付。

这些项目借鉴了 Anthropic cookbook 中公开的主管 Agent 思路。它们的价值主要是降低流程复用门槛，而非发明新的检索算法。仓库自带样例、完成度说明和“生产就绪”表述属于作者口径，不能替代独立评测。

## 为什么技能文件有效

技能把过去散落在人脑里的研究纪律变成可执行文本：什么情况下继续搜索、如何分工、什么来源优先、最后报告必须包含哪些部分。它还可以把领域要求固化下来，例如财务研究优先监管披露，医学研究优先指南和系统综述。

但文本协议只能约束行为，不能凭空补上工具能力。搜索 API 失败、网页不可访问、PDF 解析错误或上下文耗尽时，流程仍会退化。子 Agent 也可能共同引用同一个错误二手来源，形成虚假的“交叉验证”。

## 可复用的来源分级

来源等级应根据问题调整，而不是机械打分。一个实用起点是：

| 层级 | 典型来源 | 适合支持什么 |
|---|---|---|
| 一手 | 法规、统计数据库、公司披露、官方文档、论文原文 | 精确事实、规则、产品能力 |
| 高质量二手 | 系统综述、专业机构报告、可靠媒体深度报道 | 背景、综合判断、事件脉络 |
| 线索来源 | 博客、论坛、社交媒体、搜索摘要 | 发现关键词与争议，不宜单独定论 |

“官方”也不等于中立：官方文档适合证明产品提供某项功能，不足以证明它优于竞争产品。厂商 benchmark 应注明测试设置，并尽量寻找可复现材料。

## 上线前的最低验收

- 每个重要事实能否定位到直接支持它的来源？
- 引用链接是否可访问，标题、作者和日期是否一致？
- 报告是否区分已证实事实、来源主张与作者推断？
- 子 Agent 是否真正使用了不同证据，而非相互转述？
- 是否记录检索失败、时间范围和未解决的问题？

深度调研技能最适合生成研究初稿和证据地图，不应在医疗、法律、投资等高风险场景直接充当最终决策。它降低了调查的边际成本，却没有取消人对问题定义和证据质量的责任。

## 参考资料与延伸阅读

- [Anthropic research lead agent 提示词](https://github.com/anthropics/claude-cookbooks/blob/main/patterns/agents/prompts/research_lead_agent.md)
- [Anthropic multi-agent research system 介绍](https://www.anthropic.com/engineering/multi-agent-research-system)
- [简化版 Claude Code Deep Research 技能](https://github.com/liangdabiao/simple_claude_deep_research_agent)
- [完整阶段版 Claude Code Deep Research 项目](https://github.com/liangdabiao/Claude-Code-Deep-Research-main)
- [GPT Researcher 官方仓库](https://github.com/assafelovic/gpt-researcher)
- [LangChain Open Deep Research 官方仓库](https://github.com/langchain-ai/open_deep_research)

> 资料核验日期：2026-08-23。对开源技能效果的判断属于基于代码与公开材料的研究推断，不代表官方认证或统一基准结论。
