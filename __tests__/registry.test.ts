import { ProviderRegistry } from '../src/registry'
import type { AssistantProvider } from '../src/provider'
import type { ProviderSession } from '../src/session'

function makeSession(overrides: Partial<ProviderSession> = {}): ProviderSession {
  return {
    id: 'session-1',
    provider: 'test',
    projectPath: '/project',
    title: 'Test session',
    messageCount: 5,
    lastModified: new Date('2024-01-15T10:00:00Z'),
    ...overrides,
  }
}

function makeProvider(id: string, sessions: ProviderSession[]): AssistantProvider {
  return {
    id,
    displayName: id,
    isAvailable: async () => true,
    scanSessions: async () => sessions,
    loadSession: async (s) => s,
    resumeCommand: (s) => `${id} resume ${s.id}`,
  }
}

describe('ProviderRegistry', () => {
  describe('getSessions', () => {
    it('returns sessions from all registered providers sorted by lastModified desc', async () => {
      const registry = new ProviderRegistry()
      const older = makeSession({ id: 'old', provider: 'a', lastModified: new Date('2024-01-10') })
      const newer = makeSession({ id: 'new', provider: 'b', lastModified: new Date('2024-01-20') })
      registry.register(makeProvider('a', [older]))
      registry.register(makeProvider('b', [newer]))

      const result = await registry.getSessions()
      expect(result[0].id).toBe('new')
      expect(result[1].id).toBe('old')
    })

    it('filters to specified providerIds when filter provided', async () => {
      const registry = new ProviderRegistry()
      registry.register(makeProvider('claude', [makeSession({ id: 'c1', provider: 'claude' })]))
      registry.register(makeProvider('codex', [makeSession({ id: 'cx1', provider: 'codex' })]))

      const result = await registry.getSessions({ providerIds: ['codex'] })
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('cx1')
    })

    it('returns empty array when registry has no providers', async () => {
      const registry = new ProviderRegistry()
      const result = await registry.getSessions()
      expect(result).toEqual([])
    })

    it('returns empty array when filter matches no registered providers', async () => {
      const registry = new ProviderRegistry()
      registry.register(makeProvider('claude', [makeSession({ id: 'c1', provider: 'claude' })]))

      const result = await registry.getSessions({ providerIds: ['nonexistent'] })
      expect(result).toEqual([])
    })

    it('continues with remaining providers when one throws', async () => {
      const registry = new ProviderRegistry()
      const broken: AssistantProvider = {
        id: 'broken',
        displayName: 'Broken',
        isAvailable: async () => true,
        scanSessions: async () => { throw new Error('disk error') },
        loadSession: async (s) => s,
        resumeCommand: () => null,
      }
      const good = makeProvider('good', [makeSession({ id: 'g1', provider: 'good' })])
      registry.register(broken)
      registry.register(good)

      const result = await registry.getSessions()
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('g1')
    })
  })

  describe('loadSession', () => {
    it('routes to the correct provider by session.provider', async () => {
      const registry = new ProviderRegistry()
      const loaded = makeSession({ id: 'loaded', provider: 'codex', messages: [] })
      const provider = { ...makeProvider('codex', []), loadSession: async () => loaded }
      registry.register(provider)

      const session = makeSession({ id: 'loaded', provider: 'codex' })
      const result = await registry.loadSession(session)
      expect(result).toBe(loaded)
    })

    it('throws when no provider is registered for session.provider', async () => {
      const registry = new ProviderRegistry()
      const session = makeSession({ provider: 'unknown' })
      await expect(registry.loadSession(session)).rejects.toThrow('No provider registered for "unknown"')
    })
  })

  describe('getProviders', () => {
    it('returns a copy of registered providers', () => {
      const registry = new ProviderRegistry()
      registry.register(makeProvider('a', []))
      registry.register(makeProvider('b', []))
      const providers = registry.getProviders()
      expect(providers).toHaveLength(2)
      expect(providers.map(p => p.id)).toEqual(['a', 'b'])
    })
  })

  describe('register', () => {
    it('throws when a provider with the same id is registered twice', () => {
      const registry = new ProviderRegistry()
      registry.register(makeProvider('claude', []))
      expect(() => registry.register(makeProvider('claude', []))).toThrow('Provider "claude" is already registered')
    })
  })
})
