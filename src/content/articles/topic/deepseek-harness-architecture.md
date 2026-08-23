---
title: "不是又一个 Coding Agent！深度拆解 DeepSeek Harness 架构"
description: "拆解 DeepSeek Harness 长程智能体架构：状态快照持久化、工具调用自愈闭环、断点恢复与标准化隔离沙箱。"
publishedAt: "2026-08-15"
kind: "topic"
slug: "deepseek-harness-architecture"
tags: ["前沿信号", "系统架构", "智能体", "工程实战"]
cover: "/media/deepseek-harness-architecture.jpg"
featured: false
draft: false
readingMinutes: 6
video:
  bilibili: "https://www.bilibili.com/video/BV1DnbC6UELB/"
---

## 01. 封面

8 月 13 日，DeepSeek 公开了 DeepSeek Harness。很多人的第一反应可能是：DeepSeek 又来卷一款 Coding Agent 了。但我看完它的发布页、架构文档和代码组织，结论恰好相反——它开源的不是又一个成品 Agent，而是把 Agent 拆成插件以后，重新做了一套装配系统与可组合运行时。

---

## 02. 核心公式

DeepSeek 官方用了一个非常准确的公式：Agent 等于模型加 Harness。这个公式回答了一个核心问题：为什么同一个模型，在不同产品里的表现会差这么多？模型是大脑，但 Harness 决定它能不能在真实世界里工作。换一套工具、上下文组织、压缩策略与执行循环，模型的实际能力会发生质的改变。

---

## 03. 演进路线

为什么现在轮到了 Harness？过去一年半，Coding Agent 领域走过了四个关键阶段：第一阶段终端产品化，Claude Code 和 Codex 证明模型能从聊天框走进代码库；第二阶段开放多模型，OpenCode 和 Pi 争夺不绑定单一模型的自由度；第三阶段长时任务，Codex App 与 Prime Agent 解决多 Agent 监督与上下文遗忘；而第四阶段，就是现在的运行时基础设施化。

---

## 04. 六条路线一览

市面上的编程 Agent 很多，但我们抽取的六个项目，分别代表了六条完全不同层级的典型路线：Codex 是一体化工程产品栈；Claude Code 是终端产品基线；OpenCode 是开放多模型平台；Pi 是极简黑客内核；Prime Agent 是长时自治 Agent；而 DeepSeek Harness，则下沉到最底层，是一套把会话、循环、沙箱和 UI 都变成插件的可组合底座。

---

## 05. 进入 DSH 拆解

其他项目属于成品与产品平台，而 DeepSeek Harness 做的完全是另一件事。接下来，我们深入拆解 DeepSeek Harness 最值得关注的四个关键设计。

---

## 06. Cordis 无特权核心

第一，Cordis 框架没有特权核心。普通插件系统是在产品上加功能，而 DeepSeek 的 Cordis 更激进。模型适配器、工具注册表、会话日志，甚至 Agent Loop 本身都只是插件。官方架构文档明确写道：没有一个需要你去 patch 的特权核心。插件卸载时，注册产生的副作用可以完整回退；依赖变化后，其他组件能够反应式重组。

---

## 07. 时空可组合性

Cordis 论文把这种能力总结为时空可组合性（Temporal & Spatial Composability）。用汽车做比喻：普通插件是加装行车记录仪；而 Cordis 想让发动机、变速箱和仪表盘也能被随时替换，并且拆掉以后不能留下一地线头。

---

## 08. 日志即事实源

第二，日志是唯一事实源。多数 Agent 把日志当作观测的副产品，DeepSeek Harness 则把它当成了系统事实源。模型看到的内容必须写入仅追加的 Session Log。官方还精确定义了 Turn 和 Step：一个 Step 是一次模型请求加它触发的工具调用，一个 Turn 包含零个或多个 Step。当前状态只是事件流的一层投影。

---

## 09. 分叉与回放

这带来了传统 Agent 根本不具备的能力：事件溯源。当任务失败时，不只是看到一句报错，而是能完整重建它当时看见了什么、调用了什么、在哪一步压缩了上下文。然后从那个事件点分叉（Fork），换一种模型或策略重新跑一遍。这让 Harness 能够进行真正的科学评测与持续优化。

---

## 10. 把竞品当后端

第三，它能把 Codex 和 Claude Code 当后端。官方的子代理 Provider 列表里，除了进程内 Agent、Fork 和 ACP，直接内置了 Codex 与 Claude Code。这意味着 DeepSeek Harness 不只想成为它们的平行竞争者，它还想站在更上层，把这些成熟产品作为可调度的子代理，牢牢掌握 Agent 系统的组合边界。

---

## 11. 四种运行模式

第四，四种运行模式。Standard 是完整的工程 Agent；Minimal 只保留持久 Bash 和编辑器，用来消除 Harness 变量做纯净的模型基准评测；PTC 让模型写 TypeScript 代码把多步工具调用组合成程序；Creative 则允许 Agent 检查运行时、试验插件并生成新预设，具备自我改造 Harness 的元层能力。

---

## 12. PTC 与 RLM 对比

PTC 和 Prime 的 RLM 都让模型写代码，很容易被混为一谈，但两者解决的问题不同。PTC 把多轮工具调用编译成一段 TypeScript，重点是用循环、分支和并发组合工具；Prime RLM 的核心是持久 Python REPL，把大段上下文当变量进行过滤与长期推理。一句话：PTC 用程序控制工具，RLM 用程序控制上下文与 Agent。

---

## 13. 客观冷思考

架构很漂亮，但并不意味着它现在就是最好的 Coding Agent。要客观理解 DeepSeek Harness，还必须看清它的五大现实局限与安全边界。

---

## 14. 五大局限与边界

第一，它明确还是 Developer Preview，核心 API 和插件会剧烈变动；第二，一切皆插件带来了极高的理解与调试成本；第三，安全沙箱边界：文档里的 end-ups mode 仅仅描述文件系统的副作用，网络和进程可见性并不在防护语义里；第四，完整事件流包含提示词与工具输出，高度依赖企业级的权限与脱敏治理；第五，在开箱的编码体验上，它目前并没有超越打磨成熟的商业产品。

---

## 15. 到底谁适合用

所以到底谁适合用？只想直接做工程任务，Codex 和 Claude Code 更成熟；想要开放多模型成品，OpenCode 更直接；想按自己的方式轻量扩展，Pi 更灵活；想研究长时自治，Prime Agent 更明确；而想研究 Agent Loop、做 Harness 基准评测，或构建企业定制 Agent 运行时，DeepSeek Harness 才是最对应的对象。

---

## 16. 终局总结

所以，我不认为 DeepSeek Harness 是又一个跟风的 Coding Agent。前面的产品争的是开发者入口、开放生态与长时自治；而 DeepSeek Harness 则下沉了一层，开始争夺 Agent 运行时由谁定义。Agent 的下半场：Harness。

---

## 参考资料与延伸阅读

### 本文事实来源
- DeepSeek Harness 官方仓库  
  https://github.com/deepseek-ai/deepseek-harness  
  用于核对项目定位、Developer Preview、MIT 许可和入口文档。

- 官方 Architecture 文档  
  https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md  
  用于核对 Cordis、无特权核心、插件图、Turn / Step 与 Session Log。

- 官方 Subagent 文档  
  https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/subagent.md  
  用于核对 In-process、Fork、ACP、Codex、Claude Code 等 Provider。

- 官方 Sandbox 文档  
  https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/sandbox.md  
  用于核对 SandboxMode 的文件系统副作用语义及安全边界。

- Cordis 原始论文仓库  
  https://github.com/cordiverse/paper  
  用于核对 Temporal / Spatial Composability、Revertible Effects 与 Reactive Coeffects。

## 边界

- “争夺 Agent 运行时定义权”是作者基于公开架构做出的判断，不是 DeepSeek 官方表述。
- Developer Preview 不代表当前开箱体验已经超过成熟商业 Coding Agent。
- SandboxMode 的语义不能外推成完整的网络、进程或企业权限隔离。

### 相关观看入口
- [Bilibili 完整视频](https://www.bilibili.com/video/BV1DnbC6UELB/)

> 资料核验日期：2026-08-23。
