---
title: "Loop Engineering：让智能体循环可验证、可停止、可恢复"
description: "从单次提示走向自动循环后，系统需要调度、隔离状态、验证器、停止条件、成本熔断和跨运行交接。"
publishedAt: "2026-06-16"
kind: "topic"
slug: "loop-engineering-for-agents"
tags: ["Loop工程", "智能体循环", "验证器", "状态管理"]
video:
  bilibili: "https://www.bilibili.com/video/BV1dYju6bEJT/"
featured: false
draft: false
readingMinutes: 8
---
“Loop Engineering”是 2026 年出现的新兴实践标签，用来描述一种工作方式：开发者不再逐轮提示智能体，而是设计发现任务、执行、验证、保存状态和决定下一步的循环。它尚无稳定的行业标准，也不应被包装成 Prompt Engineering 的正式继任者。

这个方向的技术基础并不新。Anthropic 对 agent 的描述就是模型根据环境反馈反复使用工具，直到完成或触发停止条件。变化在于，循环开始跨越一次交互，进入定时、并行和无人值守运行。

## 循环比提示多了什么

一条可运行的循环至少需要：

- **触发器**：定时、事件、队列或人工发起；
- **任务选择器**：决定什么该做，避免重复领取；
- **隔离工作区**：并行任务不互相覆盖；
- **执行 harness**：上下文、工具、权限和沙箱；
- **验证器**：用测试或 rubric 判断是否达到目标；
- **外部状态**：记录计划、尝试、结果和下一步；
- **停止与熔断**：限制轮数、时间、费用和副作用；
- **人工门禁**：审批高影响动作和含糊结果。

因此，循环不是一个无限 while。它是一台带终止条件和证据链的状态机。

## 一个最小例子

设想每天检查失败的 CI：

1. 调度器读取失败任务，并以提交 SHA 作为幂等键。
2. 智能体在独立 worktree 中复现问题。
3. 它生成补丁并运行相关测试、静态检查和构建。
4. 验证器检查实际退出码、最终 diff 与验收条件。
5. 通过则创建待审 PR；失败则保存轨迹、成本和阻塞原因。
6. 超过轮数或预算立即停止，交给人处理。

关键不是无人参与，而是人在更清晰的位置参与：定义任务、批准权限、审核证据和处理例外。

## 验证器决定循环是否收敛

如果“完成”的定义只是模型说完成，循环会优化自我叙述而不是外部结果。验证应优先使用环境事实：测试、schema、编译结果、页面行为、业务规则和人工批准。

生成者与评估者可以使用不同上下文或角色，减少自我宽松，但第二个模型仍不是独立真相。Anthropic 的长程应用实验也指出，单独 evaluator 需要被调到更怀疑，并以具体标准约束。

收敛判定可以分三类：

- **成功停止**：必要验证全部通过，产物完整；
- **失败停止**：确定性阻塞或风险超过阈值；
- **无进展停止**：连续若干轮没有新增证据、diff 来回震荡或同类错误重复。

## 状态必须放在模型外面

长循环每轮都会产生更多可能相关的信息，而上下文窗口与注意力有限。Anthropic 的上下文工程建议使用压缩、结构化笔记和子智能体等方式，只保留高信号信息。

外部状态至少要区分事实与推断：

- 事实：命令、退出码、文件版本、测试和审批结果；
- 决策：为什么选择当前方案；
- 假设：尚未验证的解释；
- 待办：下一步及其完成条件。

恢复时先读取事实和未完成项，再按需检索历史轨迹。把全部日志重新塞入模型，既昂贵又容易让过期信息干扰当前判断。

## 熔断保护成本与系统

无人值守循环也会无人值守地犯错。应同时设置 token/费用、墙钟时间、工具调用数、重试数、并发数和外部副作用上限。删除、发布、转账、权限变更等操作不能因为进入循环就获得永久授权。

还要警惕“理解债”：系统持续提交团队未读懂的代码，短期吞吐上升，长期维护能力却下降。可以通过小批量 PR、强制代码所有者审核、决策日志和定期人工复盘控制风险。

Loop Engineering 的价值不在于让人下班后无限运行模型，而在于把重复协作变成一个有明确状态、可复现验证、有限资源和安全出口的系统。

## 参考资料与延伸阅读

- [Anthropic：Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Anthropic：Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Anthropic：Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- [Git：git-worktree documentation](https://git-scm.com/docs/git-worktree)
- [OpenAI Agents SDK：Human-in-the-loop](https://openai.github.io/openai-agents-python/human_in_the_loop/)

> 资料核验日期：2026-08-23。
