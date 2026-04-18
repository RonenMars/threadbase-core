import type { AssistantProvider } from "./provider";
import type { ProviderSession } from "./session";

export interface SessionFilter {
  providerIds?: string[];         // undefined = all registered providers
}

export class ProviderRegistry {
  private providers: AssistantProvider[] = [];

  register(provider: AssistantProvider): void {
    if (this.providers.some((p) => p.id === provider.id)) {
      throw new Error(`Provider "${provider.id}" is already registered`);
    }
    this.providers.push(provider);
  }

  getProviders(): AssistantProvider[] {
    return [...this.providers];
  }

  async getSessions(filter?: SessionFilter): Promise<ProviderSession[]> {
    const active = filter?.providerIds
      ? this.providers.filter((p) => filter.providerIds!.includes(p.id))
      : this.providers;

    const settled = await Promise.allSettled(
      active.map((p) => p.scanSessions()),
    );

    const sessions: ProviderSession[] = [];
    for (const result of settled) {
      if (result.status === "fulfilled") {
        sessions.push(...result.value);
      }
      // rejected providers are silently skipped
    }

    return sessions.sort(
      (a, b) => b.lastModified.getTime() - a.lastModified.getTime(),
    );
  }

  async loadSession(session: ProviderSession): Promise<ProviderSession> {
    const provider = this.providers.find((p) => p.id === session.provider);
    if (!provider) {
      throw new Error(`No provider registered for "${session.provider}"`);
    }
    return provider.loadSession(session);
  }
}
