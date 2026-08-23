---
title: "AI 会生成界面之后，UI/UX 设计师还设计什么？"
description: "生成式工具降低了界面初稿和原型的成本，但 AI 产品仍需要能力边界、信任、纠错、确认与设计系统。"
publishedAt: "2026-05-23"
kind: "topic"
slug: "role-redefinition-ui-ux-design"
tags: ["UI-UX", "AI交互", "原型验证", "设计系统"]
featured: false
draft: false
readingMinutes: 8
---
界面生成已经进入主流设计工具。Figma 的 First Draft 可以根据描述生成可编辑的线框图或界面，Figma Make 可以把设计和提示转成可交互原型；Adobe 的 Firefly AI Assistant 则能根据目标编排跨 Creative Cloud 应用的多步骤工作流。

这些能力确实降低了初稿、变体和素材生产的成本，却不能据此推出“UI 岗位将消失”。更准确的变化是：单纯执行既定视觉方案的价值受到挤压，而定义体验问题、验证交互和处理 AI 不确定性的工作变得更显眼。

## 生成结果是起点，不是用户体验

Figma 自己把 First Draft 定位为起点，并说明它在常见网站和移动应用模式之外可能表现不佳。这个限制很重要：生成工具擅长重组已知模式，却不会自动理解组织流程、用户心理、无障碍要求、品牌语境和错误后果。

设计师仍需回答这些问题：用户为什么来到这里？最重要的任务是什么？信息如何分层？失败后能否恢复？不同角色能看到什么、能执行什么？这些判断并不会因为画布上更快出现一个页面而自动完成。

## AI 界面的核心是校准信任

传统界面通常呈现确定规则；AI 界面还要表达能力边界和不确定性。Microsoft HAX 的 18 条人机交互指南覆盖首次使用、日常交互、系统出错和长期使用，包含说明系统能力、支持纠错、提供细粒度反馈以及告知用户操作后果等原则。

把这些原则落到产品中，可以形成一组具体检查项：

- 在用户采取行动前，说明 AI 能做什么、不能做什么；
- 重要结论同时展示依据、时间范围与已知限制；
- 允许用户编辑、撤销、申诉或转交人工；
- 对发送、付款、删除、发布等高影响动作设置明确确认；
- 区分“建议”“草稿”和“已经执行”，避免状态含混；
- 收集针对单条输出的反馈，而不只放一个笼统满意度入口。

因此，AI 交互并不等于在产品里放一个聊天框。它需要把模型能力嵌入真实任务，并让用户始终理解系统状态、控制范围和失败后的退路。

## 原型更便宜，验证应该更早

当可运行原型能快速生成，团队可以在正式开发前检验更多假设。设计师可以用低保真流程确定信息结构，再用可点击或可运行原型观察用户是否能完成任务、是否误解 AI 结论、何时需要解释和人工接管。

这项工作的价值不应靠“提前两周一定能省两个月”之类未经验证的数字来证明。更可靠的度量包括：任务完成率、关键步骤耗时、错误恢复率、人工介入点、用户对能力边界的理解，以及原型阶段被证伪的假设。原型的意义不是展示技术速度，而是用较低成本暴露风险。

## 设计系统也要覆盖 AI 状态

生成速度越快，产品越容易出现体验漂移。设计系统除了按钮、颜色和排版，还应沉淀 AI 专用模式：生成中与超时状态、引用和证据、置信提示、风险警告、人工确认、反馈与撤销、权限申请及审计入口。

这些组件不能由设计团队独自规定。Microsoft HAX 也建议 UX、产品、AI 与工程角色共同选择交互模式，因为一个界面决策往往会影响数据、模型和后端控制。

UI/UX 设计师的竞争力因此不只是熟练使用生成工具，而是能否理解业务、组织用户研究、设计人机边界、快速验证假设，并把可靠做法沉淀为系统。AI 可以让界面出现得更快；让复杂能力变得可理解、可控制、可恢复，仍是一项需要负责的设计工作。

## 参考资料与延伸阅读

- [Figma：Use First Draft with Figma AI](https://help.figma.com/hc/en-us/articles/23955143044247-Use-First-Draft-with-Figma-AI)
- [Figma：Introducing Figma Make](https://www.figma.com/blog/introducing-figma-make/)
- [Adobe：Firefly AI Assistant public beta](https://blog.adobe.com/en/publish/2026/04/27/firefly-ai-assistant-public-beta)
- [Microsoft：Guidelines for Human-AI Interaction](https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/)
- [Microsoft：HAX Design Patterns](https://www.microsoft.com/en-us/haxtoolkit/design-patterns/)

> 资料核验日期：2026-08-23。
