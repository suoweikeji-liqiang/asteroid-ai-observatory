import type { Article } from "./content";

export const topicSections = [
  {
    id: "architecture",
    label: "架构深拆",
    index: "ARCHITECTURE",
    description: "理解 Agent、Harness、记忆、RAG 与运行时背后的系统机制。"
  },
  {
    id: "engineering",
    label: "工程方法",
    index: "ENGINEERING",
    description: "把评测、安全、成本、上下文与任务编排变成可执行的方法。"
  },
  {
    id: "case-study",
    label: "案例复盘",
    index: "CASE STUDY",
    description: "从真实项目、事故与生产实践里提炼可以迁移的经验。"
  },
  {
    id: "tool-review",
    label: "工具横评",
    index: "TOOL REVIEW",
    description: "按使用场景和工程边界选择工具，不追逐一张永久排行榜。"
  },
  {
    id: "skill-lab",
    label: "技能实测",
    index: "SKILL LAB",
    description: "用固定任务验证 Skills、自动化流程与 AI 生产力工具。"
  },
  {
    id: "workplace",
    label: "岗位与行业",
    index: "WORK & INDUSTRY",
    description: "观察 AI 如何重写岗位分工、组织能力与行业人才流向。"
  }
] as const;

export type TopicSectionId = (typeof topicSections)[number]["id"];
export type TopicSection = (typeof topicSections)[number];

const caseStudies = new Set([
  "ai2-shippy-reliable-agent-architecture",
  "claude-code-quality-postmortem",
  "codeg-multi-agent-workbench",
  "datadog-incident-replay-harness",
  "gbrain-company-brain-architecture",
  "grab-multi-agent-production-patterns",
  "huggingface-agent-intrusion-postmortem",
  "industrial-agent-realtime-control-chain",
  "qwen-ui-agent-mobile-gui-architecture",
  "siemens-industrial-agent-knowledge-fabric"
]);

const engineeringTopics = new Set([
  "agent-control-plane-identity-admission",
  "agent-dynamic-capability-discovery",
  "agent-evals-launch-gate",
  "agent-governance-compliance-gate",
  "agent-safety-sandbox-evolution",
  "agent-sandbox-evolution-history",
  "agent-task-cost-roi-calculation",
  "agentic-coding-context-management",
  "broken-benchmarks-evaluation-crisis",
  "deep-research-skill-architecture",
  "gstack-judgment-as-code",
  "officeqa-enterprise-doc-agent",
  "symphony-task-board-orchestrator"
]);

const architectureTopics = new Set([
  "agent-framework-evolution",
  "agent-memory-not-vector-db",
  "agent-sdk-paradigm-shift",
  "deepseek-harness-architecture",
  "harness-engineering-principles",
  "ai-agent-harness-from-model-call-to-action",
  "llm-memory-state-layer",
  "long-running-harness-pge",
  "loop-engineering-for-agents",
  "mistral-agentic-search-architecture",
  "openai-codex-harness-architecture",
  "openclaw-hermes-openhuman",
  "opensquilla-meta-skill-runtime",
  "rag-context-layer-architecture",
  "rl-infrastructure-post-training",
  "self-evolving-agent-foundations",
  "self-evolving-agent-system-design"
]);

export function topicSectionId(article: Article): TopicSectionId {
  const slug = article.data.slug;
  if (slug.startsWith("tier-review-")) return "tool-review";
  if (slug.startsWith("skill-line-") || slug === "skill-prompt-compilation-release-engineering") return "skill-lab";
  if (slug.startsWith("role-redefinition-") || slug === "top-ai-talent-departure-analysis") return "workplace";
  if (caseStudies.has(slug)) return "case-study";
  if (engineeringTopics.has(slug)) return "engineering";
  if (architectureTopics.has(slug)) return "architecture";
  throw new Error(`专题 ${slug} 尚未设置主分类`);
}

export function topicSectionFor(article: Article): TopicSection {
  return topicSections.find((section) => section.id === topicSectionId(article))!;
}

export function topicSectionPath(id: TopicSectionId): string {
  return `/stories/${id}/`;
}
