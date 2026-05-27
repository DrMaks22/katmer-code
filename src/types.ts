// ── Claude Code stream-json event types ──

export interface SystemInitEvent {
  type: "system";
  subtype: "init";
  session_id: string;
  model: string;
  tools: string[];
  mcp_servers: Array<{ name: string; status: string }>;
  claude_code_version: string;
}

export interface AssistantMessageEvent {
  type: "assistant";
  message: {
    id: string;
    model: string;
    role: "assistant";
    content: ContentBlock[];
    stop_reason: string | null;
    usage: {
      input_tokens: number;
      output_tokens: number;
      cache_read_input_tokens?: number;
      cache_creation_input_tokens?: number;
    };
  };
  session_id: string;
  /** null = main agent, string = subagent tool_use_id */
  parent_tool_use_id?: string | null;
}

export interface ContentBlock {
  type: "text" | "tool_use" | "tool_result" | "thinking";
  text?: string;
  thinking?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  content?: string | Array<{ type: string; text?: string }>;
  is_error?: boolean;
}

export interface ResultEvent {
  type: "result";
  subtype: "success" | "error";
  is_error: boolean;
  duration_ms: number;
  result: string;
  total_cost_usd: number;
  session_id: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
  };
}

export interface RateLimitEvent {
  type: "rate_limit_event";
  rate_limit_info: {
    status: string;
    resetsAt: number;
  };
}

export interface StreamDeltaEvent {
  type: "stream_delta";
  /** Incrementally growing text for the current text block */
  text: string;
  /** Whether this is a subagent stream */
  parent_tool_use_id?: string | null;
}

export type ClaudeEvent =
  | SystemInitEvent
  | AssistantMessageEvent
  | ResultEvent
  | RateLimitEvent
  | StreamDeltaEvent
  | { type: string; [key: string]: unknown };

// ── UI State ──

export type ContentSegment =
  | { type: "text"; text: string }
  | { type: "tool"; tool: ToolCallInfo };

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  toolCalls?: ToolCallInfo[];
  /** Ordered content blocks preserving text ↔ tool interleaving */
  segments?: ContentSegment[];
  timestamp: number;
  isStreaming?: boolean;
  /** Attached context shown in user message bubble */
  attachments?: Array<{ type: "selection" | "file"; name: string; preview?: string }>;
}

export interface ToolCallInfo {
  id: string;
  name: string;
  input: Record<string, unknown>;
  result?: string;
  isError?: boolean;
  duration?: number;
  startTime?: number;
}

export interface SessionInfo {
  sessionId: string;
  model: string;
  mcpServers: Array<{ name: string; status: string }>;
  cliVersion: string;
  totalCost: number;
  inputTokens: number;
  outputTokens: number;
  contextWindow: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
}

// ── Model & Effort ──

export type ModelChoice = "opus" | "opus[1m]" | "sonnet" | "haiku";
export type EffortLevel = "low" | "medium" | "high" | "max";

export const MODEL_LABEL_KEYS: Record<ModelChoice, string> = {
  "opus[1m]": "app.model.opus1m.label",
  opus: "app.model.opus.label",
  sonnet: "app.model.sonnet.label",
  haiku: "app.model.haiku.label",
};

export const MODEL_DESCRIPTION_KEYS: Record<ModelChoice, string> = {
  "opus[1m]": "app.model.opus1m.description",
  opus: "app.model.opus.description",
  sonnet: "app.model.sonnet.description",
  haiku: "app.model.haiku.description",
};

export const MODEL_LABELS: Record<ModelChoice, string> = {
  "opus[1m]": "Opus 1M",
  opus: "Opus",
  sonnet: "Sonnet",
  haiku: "Haiku",
};

export const EFFORT_LABELS: Record<EffortLevel, string> = {
  low: "Low",
  medium: "Med",
  high: "High",
  max: "Max",
};

export const EFFORT_LABEL_KEYS: Record<EffortLevel, string> = {
  low: "app.effort.low.label",
  medium: "app.effort.medium.label",
  high: "app.effort.high.label",
  max: "app.effort.max.label",
};

// ── Session History ──

export interface SavedSession {
  sessionId: string;
  firstMessage: string;
  model: string;
  timestamp: number;
  messageCount: number;
  messages: ChatMessage[];
}

// ── Settings ──

// ── Skills ──

export interface SkillDef {
  id: string;
  name: string;
  nameKey: string;
  description: string;
  descriptionKey: string;
  category: SkillCategory;
  categoryKey: string;
  fileName: string;  // e.g. "peer-review.md"
}

export type SkillCategory = "research" | "writing" | "analysis" | "transform";

export const CATEGORY_LABEL_KEYS: Record<SkillCategory, string> = {
  research: "app.category.research.label",
  writing: "app.category.writing.label",
  analysis: "app.category.analysis.label",
  transform: "app.category.transform.label",
};

export const SKILL_CATALOG: SkillDef[] = [
  // Research
  { id: "lit-search", name: "/lit-search", nameKey: "skill.lit-search.name", description: "Multi-database literature search", descriptionKey: "skill.lit-search.description", category: "research", categoryKey: CATEGORY_LABEL_KEYS.research, fileName: "lit-search.md" },
  { id: "citation-network", name: "/citation-network", nameKey: "skill.citation-network.name", description: "Citation graph analysis + visualization", descriptionKey: "skill.citation-network.description", category: "research", categoryKey: CATEGORY_LABEL_KEYS.research, fileName: "citation-network.md" },
  { id: "research-gap", name: "/research-gap", nameKey: "skill.research-gap.name", description: "Research gap analysis + trends", descriptionKey: "skill.research-gap.description", category: "research", categoryKey: CATEGORY_LABEL_KEYS.research, fileName: "research-gap.md" },
  // Writing
  { id: "peer-review", name: "/peer-review", nameKey: "skill.peer-review.name", description: "Academic peer review (8 criteria)", descriptionKey: "skill.peer-review.description", category: "writing", categoryKey: CATEGORY_LABEL_KEYS.writing, fileName: "peer-review.md" },
  { id: "cite-verify", name: "/cite-verify", nameKey: "skill.cite-verify.name", description: "Citation verification via DOI/CrossRef", descriptionKey: "skill.cite-verify.description", category: "writing", categoryKey: CATEGORY_LABEL_KEYS.writing, fileName: "cite-verify.md" },
  { id: "abstract", name: "/abstract", nameKey: "skill.abstract.name", description: "Generate abstract (5 formats, bilingual)", descriptionKey: "skill.abstract.description", category: "writing", categoryKey: CATEGORY_LABEL_KEYS.writing, fileName: "abstract.md" },
  // Analysis
  { id: "journal-match", name: "/journal-match", nameKey: "skill.journal-match.name", description: "Journal recommendation for manuscript", descriptionKey: "skill.journal-match.description", category: "analysis", categoryKey: CATEGORY_LABEL_KEYS.analysis, fileName: "journal-match.md" },
  // Design system (auto-installed with any skill)
  { id: "report-template", name: "/report-template", nameKey: "skill.report-template.name", description: "Report design system (academic book aesthetic)", descriptionKey: "skill.report-template.description", category: "transform", categoryKey: CATEGORY_LABEL_KEYS.transform, fileName: "report-template.md" },
];

export const CATEGORY_LABELS: Record<SkillCategory, string> = {
  research: "Research",
  writing: "Writing & editing",
  analysis: "Analysis",
  transform: "Transform",
};

export type PermissionMode = "default" | "acceptEdits" | "bypassPermissions";

export interface ClaudeNativeSettings {
  cliPath: string;
  workingDirectory: string;
  defaultModel: ModelChoice;
  permissionMode: PermissionMode;
  allowWebRequests: boolean;
  maxScrollback: number;
  showToolCalls: boolean;
  showCostInfo: boolean;
  sessions: SavedSession[];
  enabledSkills: string[];  // skill IDs
}

export const DEFAULT_SETTINGS: ClaudeNativeSettings = {
  cliPath: "claude",
  workingDirectory: "",
  defaultModel: "sonnet",
  permissionMode: "acceptEdits",
  allowWebRequests: false,
  maxScrollback: 200,
  showToolCalls: true,
  showCostInfo: true,
  sessions: [],
  enabledSkills: [],
};
