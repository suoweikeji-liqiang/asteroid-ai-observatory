---
title: "长程智能体为何跑偏：Planner–Generator–Evaluator 架构解析"
description: "基于 Anthropic 的长程应用实验，分析任务分解、外部状态、独立评估、恢复机制及多小时运行的成本与适用边界。"
publishedAt: "2026-05-24"
kind: "topic"
slug: "long-running-harness-pge"
tags: ["长程智能体", "Harness工程", "任务规划", "AI评测"]
featured: false
draft: false
readingMinutes: 8
---
短任务里，智能体可以依赖当前对话维持方向。任务延长后，需求、决策、失败尝试和工作区状态不断累积，模型容易把局部测试通过误当成整体完成，也可能在上下文压缩后重复走过失败路线。

Anthropic 在 2026 年 3 月发布的工程文章中，展示了一套用于长程应用开发的 planner–generator–evaluator 架构。它是一次厂商实验，不是经过多团队独立验证的通用标准；真正值得借鉴的是把规划、执行、评估和交接显式化的方法。

## 三个角色解决三种偏差

**Planner** 把简短目标扩展为产品规格，定义交付范围和高层技术约束。原实验刻意避免过早规定细节，因为错误的细节会向后级联。

**Generator** 负责实现应用、调用工具和根据反馈修改。它应围绕明确产物工作，而不是在每个局部问题上重新定义总目标。

**Evaluator** 从用户路径和验收标准出发检查结果。Anthropic 的实验让 evaluator 通过 Playwright 操作实际应用，并结合功能、设计和代码质量标准反馈问题。

角色分离的价值不在于“多一个模型一定更准”，而在于让生成与判断使用不同目标。独立 evaluator 仍可能宽松或误判，必须通过清晰 rubric、确定性测试和人工抽检校准。

## 结构化产物比长聊天更适合交接

长对话混合了探索、错误和过期判断，不适合作为唯一状态源。跨轮次或跨进程工作更需要外部产物：

- 当前目标、任务清单和依赖；
- 已完成项及其验证证据；
- 关键设计决策与理由；
- 已失败方案和不应重复的尝试；
- 工作区版本、测试状态和剩余风险；
- 下一步输入、输出与停止条件。

这些文件应由实际仓库和测试结果校验。交接摘要若只由模型自由生成，也可能遗漏关键状态。

## 长程运行需要恢复而不只是记忆

生产系统还要处理进程退出、限额、人工暂停和工具故障。最小恢复设计包括：

1. 每个任务块有稳定 ID、状态和幂等边界。
2. 工作产物提交到可版本化存储。
3. 工具调用记录请求、结果和副作用。
4. 检查点能重建任务，而不是依赖原进程内存。
5. 重试有次数与成本上限，并区分可重试和永久失败。
6. 恢复后先核对外部世界，防止重复付款、发布或删除。
7. 人工可以查看证据、修改计划或终止任务。

## 多小时并不等于更高质量

Anthropic 报告中的早期完整 harness 运行约 6 小时、花费约 200 美元，而简化后的另一项应用实验约 3 小时 50 分、花费 124.70 美元。数字来自特定提示、模型和 2026 年价格，只说明该实验的量级；不能外推为固定成本或质量保证。

文章还展示了随着模型能力变化，原先必要的 session reset 和 sprint 分解可能不再需要。维护者应定期做消融：删除一个组件，比较结果、成本和失败类型。无法证明价值的结构应被简化。

## 哪些任务适合长程 harness

更适合的任务通常具备：可隔离工作区、可版本化产物、机器可运行的验证器、可限制权限，以及失败后可安全重试。主观目标、高风险操作或需求仍在快速变化的任务，需要更频繁的人类检查点。

可以从一条短闭环开始：规划一个任务块，执行并保存产物，由独立验证器检查，失败则写回具体证据，成功才进入下一块。先证明这条链能恢复、能停止、能控制成本，再延长运行时间。

长程智能体的工程分水岭不是连续运行了多少小时，而是中断后能否接续、完成时能否举证、偏离时能否被发现和纠正。

## 参考资料与延伸阅读

- [Anthropic：Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- [Anthropic：Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Anthropic：Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [OpenAI Agents SDK：Durable execution integrations](https://openai.github.io/openai-agents-python/running_agents/#durable-execution-integrations-and-human-in-the-loop)

> 资料核验日期：2026-08-23。
