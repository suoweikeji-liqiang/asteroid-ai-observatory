---
title: "从 Linux 容器到 MicroVM：智能体沙箱如何选择隔离边界"
description: "用可见范围、系统调用、资源、网络和持久化五个问题，理解 Docker、gVisor、Firecracker 与托管 Agent 沙箱的取舍。"
publishedAt: "2026-06-20"
kind: "topic"
slug: "agent-sandbox-evolution-history"
tags: ["Agent沙箱", "容器安全", "gVisor", "MicroVM"]
featured: false
draft: false
readingMinutes: 9
---
智能体能够生成并执行代码、安装依赖、浏览网页和调用外部 API。这样的工作负载可能只是写错，也可能受到不可信内容诱导；无论原因是什么，执行后果都需要被限制。

“沙箱”不是某一种产品，而是一个安全目标。评估方案时可以连续追问五件事：进程能看见什么、能调用什么、能占用多少资源、能连接哪里，以及结束后能留下什么。

## Linux 原语：把进程的权限逐项收回

Linux 提供的是可组合原语，而不是一个万能沙箱：

- namespace 隔离进程、挂载点、网络等视图；
- cgroup 统计并限制 CPU、内存和进程数量等资源；
- seccomp 过滤系统调用；
- capabilities、用户命名空间及 AppArmor/SELinux 进一步缩小权限；
- 文件系统挂载与网络策略控制数据和出口。

这些机制必须组合使用。只限制进程视图不能阻止资源耗尽，只设内存上限也不能阻止敏感文件被读取。

Docker 把命名空间、cgroup、镜像和运行时打包成易用的工程系统，但容器通常仍与宿主共享内核。Docker 官方文档还说明，容器默认没有资源约束；默认 seccomp 配置是兼顾兼容性的“适度保护”。特权模式、危险的宿主目录挂载或把 Docker daemon 控制接口交给容器，都会显著改变威胁模型。

因此，“使用 Docker”不是安全结论。需要同时说明 rootless、capability、seccomp、文件挂载、资源限额、网络与 daemon 权限如何配置。

## gVisor：在系统调用路径上增加用户态内核

gVisor 的 Sentry 在应用与宿主内核之间实现大量 Linux 系统接口。应用的系统调用先进入 Sentry，只有部分操作继续触及宿主内核，从而减少不可信进程直接面对的内核攻击面。

这条路线保留了 OCI 容器工作流，但不是完整 Linux 的无成本替代。系统调用兼容性和工作负载性能都需要实测，尤其是依赖特殊内核行为或大量 I/O 的应用。它适合希望加强容器隔离、又不想为每个任务维护完整虚拟机的场景。

## Firecracker：用独立客户机内核换取更强边界

Firecracker 基于 KVM 创建精简的 MicroVM，每个实例拥有自己的客户机内核，并缩减虚拟硬件模型。与共享宿主内核的普通容器相比，这把主要隔离边界下沉到了硬件虚拟化层。

Firecracker 项目给出的快速启动与低内存数字来自指定硬件和配置，只能作为设计目标，不能当作任何部署环境的保证。镜像、内核、快照、存储和调度策略都会改变启动时间与密度。

MicroVM 也不是自动安全：宿主和客户机内核仍需更新，设备与管理接口仍需保护，网络和凭证策略也不能省略。

## Agent 沙箱服务：隔离之外还有控制面

E2B 等服务把实例生命周期、模板、文件传输、命令执行和超时控制封装成面向智能体的 API；E2B 官方说明其沙箱运行在 Firecracker MicroVM 中。另一些统一沙箱 API 可以连接 Docker、Kubernetes 或其他运行时。

这提醒我们，产品名中的 “sandbox” 不等于特定隔离等级。采购或自建时应确认每个租户实际使用的是进程、容器、用户态内核还是独立虚拟机，以及实例之间是否共享宿主内核。

## 墙和钥匙是两套控制

最强的隔离墙，也挡不住工作负载使用被合法放入沙箱的长期密钥，再通过开放网络发送出去。隔离控制“能否突破边界”，权限与数据设计控制“边界内本来允许做什么”。

一套面向不可信代码的最小设计通常包括：

1. 默认只读或临时文件系统，任务结束即销毁。
2. CPU、内存、进程、磁盘、执行时间和并发均有限额。
3. 网络默认拒绝，只开放任务需要的目的地与协议。
4. 长期凭证留在可信控制面；沙箱按次申请短效、最小范围令牌。
5. 高影响动作经过策略检查或人工批准。
6. 命令、文件变化、网络请求和资源使用可审计。
7. 运行时接口保持可替换，并用真实工作负载验证兼容性和性能。

沙箱只能缩小事故半径，不能判断智能体的目标是否已被提示注入改变，也不能替代输入验证、最小权限和人工确认。正确的选型不是寻找“绝对安全”的名字，而是先写清威胁模型，再选择足以覆盖风险的隔离边界。

## 参考资料与延伸阅读

- [Linux manual：namespaces(7)](https://man7.org/linux/man-pages/man7/namespaces.7.html)
- [Linux Kernel：Control Group v2](https://docs.kernel.org/admin-guide/cgroup-v2.html)
- [Docker：Engine security](https://docs.docker.com/engine/security/)
- [Docker：Resource constraints](https://docs.docker.com/engine/containers/resource_constraints/)
- [gVisor：Architecture Guide](https://gvisor.dev/docs/architecture_guide/intro/)
- [Firecracker 官方仓库](https://github.com/firecracker-microvm/firecracker)
- [E2B：Sandbox](https://e2b.dev/docs/sandbox)
- [OWASP：Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)

> 资料核验日期：2026-08-23。
