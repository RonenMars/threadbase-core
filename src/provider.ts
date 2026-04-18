import type { ProviderSession } from "./session";

export interface AssistantProvider {
  readonly id: string;            // stable, lowercase: "claude", "codex"
  readonly displayName: string;   // "Claude Code", "Codex CLI"
  isAvailable(): Promise<boolean>;
  scanSessions(): Promise<ProviderSession[]>;
  loadSession(session: ProviderSession): Promise<ProviderSession>;
  resumeCommand(session: ProviderSession): string | null;
}
