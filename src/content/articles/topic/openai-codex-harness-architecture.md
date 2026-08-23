---
title: "OpenAI Codex Harness 深度解析：模型之外，Agent 真正的执行系统"
description: "深度拆解 OpenAI Open Agent Harness：从 Agent Loop 执行闭环、App Server 双向交互协议到业务沙箱边界与生产级落地实践。"
publishedAt: "2026-08-22"
kind: "topic"
slug: "openai-codex-harness-architecture"
tags: ["前沿信号", "系统架构", "智能体", "工程实战"]
cover: "/media/openai-codex-harness-architecture.jpg"
featured: true
draft: false
readingMinutes: 11
video:
  bilibili: "https://www.bilibili.com/video/BV1kc8S6DE35/"
---

## 01. 引入：同一个模型，表现天差地别

很多人评估 AI Agent 时，第一反应往往是模型参数够不够大、推理能力够不够强，或者提示词写得够不够巧。但如果你实际做过复杂任务，就会发现一个普遍现象：把同一个大模型放进两个不同的 Agent 框架里，表现可以天差地别。2026 年 8 月 19 日，OpenAI 正式把驱动多种 Codex 体验的既有开源组件，统一定位为可嵌入第三方产品的 Open Agent Harness。

---

## 02. 核心痛点：为什么需要 Agent Harness

同一个模型，有的 Agent 能在长程任务里连续工作几十分钟，自己读文件、查文档、跑单元测试、遭遇报错后自我修复；而另一个 Agent 可能刚调了两次工具，就会陷入死循环或者把上下文忘得一干二净。这种差距的根源，不只在模型本身。在模型外面，必须有一整套工程系统，负责帮它收集动态上下文、管理多轮工具循环、维护长程状态、划定沙箱与权限边界、处理异常中断，并在必要时向人类请求批准。这套包围在模型周围的执行系统，就是 Agent Harness。

---

## 03. 关键事实纠错：这不是 Codex 第一次开源

在展开它的技术架构前，我们先澄清一个最容易被误解的事实：这不是 OpenAI 在 2026 年 8 月突然把一个全新的 Codex 项目开源了。梳理 Codex 的演进路线：早在 2025 年 4 月，OpenAI 就已经首次开源了轻量级 Codex CLI；2025 年 10 月，官方推出了封装核心逻辑的 Codex SDK；到了 2026 年初，又先后公开了长程 Agent Loop 与 App Server 的底层架构。所以，这次发布真正具有转折意义的，不是代码第一次放出来，而是 OpenAI 终于把过去一年多持续演进、逐步公开的离散组件，做了一次体系化的平台化收口。它从 OpenAI 自己的产品底座，进一步成为第三方团队可以复用的开放运行层。

---

## 04. 开源边界划分：开源了什么，没开源什么

既然定位为开放平台，它的开源边界到底划在哪里？当前官方列为开源的组件包括：Codex CLI、Core、App Server、官方 TypeScript 与 Python SDK，以及 Skills 和 Plugins 等扩展机制；主仓库采用 Apache-2.0 许可证。但是，完整 Codex 产品线并没有全部开源。官方指南明确标明：Codex IDE Extension 插件源码没有开源；Codex Cloud 产品本身没有开源，部分基础环境开源不等于整套云产品开放。底层的模型服务与托管计费，依然属于独立提供的商业层。你可以二次开发这套 Agent 的底层运行逻辑，但这不代表大模型本身的权重和托管服务也包含在内。开源的是 Agent 的运行层与集成面，而不是整个商业产品线。

---

## 05. 核心定义与实验证据：Harness 的五项核心职责

那么，这个被称为 Harness 的系统，在实际运行时到底承担哪些职责？如果我们把一个端到端的 Agent 系统做层次拆解：底层的模型负责单步推理，在每一次请求中生成文本、推理片段或工具调用请求；而中间的 Harness，则要承担五项核心系统职责：第一，上下文组装，把指令、AGENTS.md、Skills、工作区状态与历史精确拼装成稳定的提示词输入；第二，工具闭环，调度命令或 MCP 并将结果与报错实时回填给模型，驱动下一步决策；第三，状态管理与压缩，管理长程会话生命周期，在 Token 逼近上限时进行智能压缩，保留核心目标与关键证据；第四，沙箱与安全控制，划定文件与网络访问边界，遇到敏感操作主动挂起；第五，流式事件暴露，将推理状态、Agent 消息、命令、Diff 和工具进度实时暴露给界面。在 OpenAI 的实验里，同一个模型仅靠保留推理和上下文压缩，得分就从 13.3% 提升到 38.3%，输出 Token 还降到了约六分之一。这说明 Harness 不是包装层，它会直接影响长程任务的能力和成本。

---

## 06. 执行闭环：一次回合不等于一次模型调用

为了实现这种长程作业能力，Harness 最核心的内部执行引擎，就是 Agent Loop，也就是智能体执行循环。在日常开发中，很多人容易有一个直觉误区：以为用户在界面上给 Agent 发一条任务指令，后端就只是去调一次大模型 API。但在工业级 Harness 体系里，用户的一次交互回合 Turn，绝不等于一次简单的模型调用。当用户提交一个复杂任务、发起一次交互后，Harness 首先在后台组装完整的初始上下文——包含工作区结构、指令规范、当前环境以及可用工具定义，随后驱动模型进行单步推理。如果模型直接给出了最终答案，这次交互就可以结束；但如果模型决定调用工具，Harness 就会立刻接管并进入执行闭环：先做沙箱与安全策略检查，再执行本地命令或读写文件，随后把工具产生的新数据和报错追加到上下文，紧接着自动发起下一轮模型推理。也就是说，在用户看来的“一次任务来回”内部，模型推理与工具执行可能会在后台反复往返几十轮。在这个持续往返的循环中，保持 Prompt Cache 前缀稳定以降低延迟与成本，以及在历史过长时执行 Context Compaction 结构化压缩，是保障长程任务可行性的核心关键。

---

## 07. 产品化核心：App Server 架构拆解

理解了 Agent Loop，下一个核心问题就是：怎么把它做成供各种产品调用的通用平台？核心组件就是 Codex App Server。回顾演进：Codex 最初只是终端 CLI 工具，但当需要开发 VS Code 插件、Web 界面甚至企业后台时，面临巨大挑战：如何让不同前端复用同一套底层 Agent Loop，同时还能实时渲染动态进度、文件 Diff 和审批弹窗？OpenAI 最早曾尝试直接将 Codex 封装为 MCP Server，但很快发现 MCP 的标准语义偏向单次工具调用，很难表达长程会话里的细粒度生命周期、流式进度与双向中断恢复。于是，OpenAI 专门设计了长驻进程 App Server，对外提供双向 JSON-RPC 风格协议。官方架构由四个核心组件协同构成：第一，stdio reader 协议接入层，负责 JSONL 消息的底层读写与反序列化；第二，Message Processor 消息处理器，将底层 Core 事件转换为前端稳定消费的通知；第三，Thread Manager 线程管理器，管理长程会话的创建、持久化、状态恢复与分叉；第四，Core Sessions 执行实例，真正驱动 Agent Loop 运行。

---

## 08. 交互时序：为什么智能体协议必须双向

针对产品化设计，App Server 抽象出了 Thread 长期会话、Turn 交互回合与 Item 原子事件三层模型。为什么这种协议必须是双向的？因为在传统的单向请求中，只有客户端能向服务端发指令；但在 Agent 运行过程中，服务端不仅要持续推送 item started、delta 和 completed 等进度事件；当遇到敏感高危操作时，服务端还会主动向客户端发起审批请求，并暂停当前 Turn。此时整个交互处于挂起状态，直到人类在前端点击允许或拒绝，客户端回传响应后，Agent 才会继续向下执行，最终以 turn completed 结束。这种双向事件流与主动挂起机制，正是支撑产品级 Rich UI 与人机协同审批的协议基石。

---

## 09. 接入选型：四种集成路线怎么选

在实际工程落地时，OpenAI 提供了四种清晰的接入层次，团队应当按照控制深度进行选型：第一，codex exec 命令行，适用于 CI/CD 流水线、批处理脚本或一次性离线任务，可以通过 --json 输出结构化 JSONL 事件，适合接进自动化流水线；第二，Codex SDK，适用于后端代码驱动的任务工作流，通过 API 创建会话并消费流式回调，注意当前 SDK 主要是对本地 CLI 运行时的封装；第三，App Server，做产品级界面优先考虑，适用于自研专业业务看板、IDE 插件或需要完整会话历史、流式 Diff 与人机审批界面的交互式产品；第四，Codex MCP Server，当系统已有更大上层编排器时，把 Codex 作为专业的编码工具节点暴露给其他框架调用。四种路线各司其职：一次性任务选 exec，代码工作流选 SDK，做产品级界面选 App Server，多智能体协同选 Codex MCP Server。

---

## 10. 生态定位：OpenAI 智能体技术栈全景

随着 Harness 的开放，很多开发者容易把它与 OpenAI 的其他工具搞混。我们可以把 OpenAI 当前的 Agent 相关技术理解为清晰的五层技术栈：第一层是基础智能模型，由 OpenAI 模型与 Responses API 提供核心单步理解与推理；第二层是环境与工具原语，包括 Shell、MCP 协议、操作系统沙箱与技能规范；第三层是 Agent Harness 运行层，包括通用的 Agents SDK 与更聚焦编码工作流的 Codex Harness，它们是单 Agent 的自闭环执行系统；第四层是领域产品与业务界面，例如 Relay 示例、智能运维看板或垂直系统；第五层是任务与组织编排层，例如 Symphony，负责多任务分发、并行调度与超时重试。Codex Harness 的定位，是单 Agent 运行层的工业级底座，而非包揽一切的完整 Agent OS。

---

## 11. 安全红线：沙箱不自动保护外部业务工具

谈到 Agent 落地，安全永远是第一生命线。这里存在一个极其普遍的安全误区：Codex 内置了操作系统沙箱，主要用来约束它自带的 Shell 与系统工具。外部业务 MCP 工具不会自动受到 Codex Shell 沙箱的约束，必须由 MCP Server 和 Host Application 自行实施鉴权、审批和防护。比如你的业务 MCP 提供了修改报警阈值、重启服务器集群或下发控制指令，绝不能因为处于沙箱模式就默认安全。宿主应用必须在自己的业务网关处建立纵深防御：包括对象级鉴权、风险分级、强制人工审批、幂等设计、审计追踪与回滚机制。同时外部返回的日志或网页可能携带间接提示词注入，系统必须严格隔离只读证据查询与高危参数下发。业务操作的最终安全责任，永远在 Host Application。

---

## 12. 落地实战：主动运维诊断台建议架构

这套架构在垂直行业该如何落地？以主动运维诊断台为例：业务界面不再是空白聊天框，而是标准的监控运维看板。监控报警触发后，工程师在 Issue Queue 选中故障设备点击一键诊断；Context Builder 自动拼装设备拓扑、故障时间窗口、告警点位与权限，形成高度结构化的初始上下文送入 App Server；Agent 先通过只读业务 MCP 工具，逐步查询 TDengine 时序数据、设备在线状态与网关日志，界面实时展示排查进度与证据链时间线；如果需要修改控制参数或重启服务，请求进入 Approval Gateway 人工审批；全流程记录完整 Trace 轨迹，归档用于后续重放与领域基准评测。业务系统掌握数据与界面，Harness 提供执行闭环。

---

## 13. 总结与启示：业务工作流才是产品护城河

总结全篇，OpenAI 将 Codex Harness 平台化释放了三个明确信号：第一，Agent 竞争正在从单体模型参数比拼，升级为外围运行时、工具闭环、状态恢复与安全边界的综合系统工程；第二，通用 Agent Loop 与双向协议底座正在迅速基础设施化，团队没有必要每次从零重写；第三，Agent 产品正以极低阻力深度嵌入现有业务工单、看板与 IDE 中。开源 Harness 底座不会自动带来成功的产品。模型提供能力潜力，Harness 决定这些能力能否在长程任务里稳定发挥；领域工具、业务上下文、安全和 Eval，决定最终产品价值。

---

## 参考资料与延伸阅读

### 本文事实来源
- OpenAI：Codex as a platform: build on the open agent harness  
  https://developers.openai.com/blog/codex-as-a-platform  
  用于核对 Open Agent Harness 的平台定位、应用与 Harness 的责任边界，以及 exec、SDK、App Server 等集成路线。

- OpenAI：Unrolling the Codex agent loop  
  https://openai.com/index/unrolling-the-codex-agent-loop/  
  用于核对上下文拼装、工具循环、Prompt Cache、上下文压缩与安全边界。

- OpenAI：Unlocking the Codex harness: how we built the App Server  
  https://openai.com/index/unlocking-the-codex-harness/  
  用于核对 App Server 的起源、四组件架构、双向协议以及 Thread / Turn / Item。

- OpenAI Codex App Server 文档  
  https://developers.openai.com/codex/app-server  
  用于核对当前协议、生命周期、事件、审批与 Schema。

- OpenAI Codex Open Source 指南  
  https://developers.openai.com/codex/open-source  
  用于核对开源组件及 IDE Extension、Codex Cloud 的边界。

- OpenAI Codex SDK  
  https://developers.openai.com/codex/sdk

- OpenAI Codex Non-interactive mode  
  https://developers.openai.com/codex/noninteractive

- OpenAI Codex Sandboxing  
  https://developers.openai.com/codex/sandbox

- OpenAI Codex 官方仓库与许可证  
  https://github.com/openai/codex  
  https://github.com/openai/codex/blob/main/LICENSE

- OpenAI：Symphony  
  https://openai.com/index/open-source-codex-orchestration-symphony/

## 边界

- 本期所说“平台化”，指既有开源组件被统一定位为第三方产品可嵌入的 Open Agent Harness，不代表完整 Codex Cloud、IDE Extension、模型权重或托管服务开源。
- ARC-AGI-3 的 13.3% → 38.3% 与 Token 降低约六倍来自官方给出的特定实验，用于说明 Harness 架构可能显著影响长程表现与成本。
- 主动运维诊断台是基于官方 Relay 范式推演的建议架构，不是 OpenAI 已发布的正式产品。

### 相关观看入口
- [Bilibili 完整视频](https://www.bilibili.com/video/BV1kc8S6DE35/)

> 资料核验日期：2026-08-23。
