// ─── Tool Use Block ──────────────────────────────────────────────────

export interface ToolUseBlock {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

// ─── Tool Result Types ───────────────────────────────────────────────

export interface StructuredPatchHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: string[];
}

export interface EditToolResult {
  type: "edit";
  filePath: string;
  oldString: string;
  newString: string;
  structuredPatch: StructuredPatchHunk[];
  userModified: boolean;
  replaceAll: boolean;
}

export interface BashToolResult {
  type: "bash";
  stdout: string;
  stderr: string;
  interrupted: boolean;
  command?: string;
  description?: string;
}

export interface ReadToolResult {
  type: "read";
  filePath: string;
  content?: string;
}

export interface WriteToolResult {
  type: "write";
  filePath: string;
}

export interface GlobToolResult {
  type: "glob";
  filenames: string[];
  numFiles: number;
  truncated: boolean;
}

export interface GrepToolResult {
  type: "grep";
  mode: string;
  filenames: string[];
  content: string;
  numFiles: number;
  numLines: number;
}

export interface TaskAgentToolResult {
  type: "taskAgent";
  status: string;
  prompt: string;
  agentId: string;
}

export interface TaskCreateToolResult {
  type: "taskCreate";
  taskId: string;
  subject: string;
}

export interface TaskUpdateToolResult {
  type: "taskUpdate";
  taskId: string;
  updatedFields: string[];
  statusChange?: { from: string; to: string };
}

export interface GenericToolResult {
  type: "generic";
  toolName: string;
  input?: Record<string, unknown>;
  data: Record<string, unknown>;
}

export type ToolResult =
  | EditToolResult
  | BashToolResult
  | ReadToolResult
  | WriteToolResult
  | GlobToolResult
  | GrepToolResult
  | TaskAgentToolResult
  | TaskCreateToolResult
  | TaskUpdateToolResult
  | GenericToolResult;

// ─── Provider Types ──────────────────────────────────────────────────

export interface ProviderSession {
  id: string;
  provider: string;             // "claude" | "codex" | future IDs
  projectPath: string;
  title: string;                // first user message, or filename fallback
  messageCount: number;
  lastModified: Date;
  model?: string;
  gitBranch?: string;
  isSubagent?: boolean;         // true when spawned via the Agent tool
  isTeammate?: boolean;         // true when session started with a <teammate-message> block
  messages?: ProviderMessage[]; // undefined until loadSession() resolves
}

export interface ProviderMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  uuid?: string;
  isToolResult?: boolean;
  // Token usage
  inputTokens?: number;
  outputTokens?: number;
  cacheReadTokens?: number;
  cacheCreationTokens?: number;
  // Model / runtime info
  model?: string;
  stopReason?: string | null;
  gitBranch?: string;
  version?: string;
  // Tool tracking
  toolNames?: string[];
  toolUseBlocks?: ToolUseBlock[];
  toolResults?: ToolResult[];
}
