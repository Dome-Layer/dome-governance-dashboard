import { describe, expect, it } from 'vitest'
import { contentSecurityPolicy, isNoindexHost, isProxied, makeNonce, shellFor } from './index'
import { idFromPath } from '../lib/routeId'

describe('tool Worker', () => {
  it('builds the CSP production sent, with the nonce and wasm-unsafe-eval in script-src', () => {
    const csp = contentSecurityPolicy('abc')
    expect(csp.startsWith("default-src 'self'; script-src 'self' 'nonce-abc' 'strict-dynamic' 'wasm-unsafe-eval'; ")).toBe(true)
    expect(csp).toContain('https://*.supabase.co')
    expect(csp).not.toContain('{NONCE}')
  })

  it('makes a fresh 128-bit nonce each time', () => {
    const a = makeNonce()
    expect(atob(a)).toHaveLength(16)
    expect(makeNonce()).not.toBe(a)
  })

  it('serves events and runs from their prebuilt shells, payloads included', () => {
    expect(shellFor('/events/0b9f-event')).toBe('/events/_')
    expect(shellFor('/events/0b9f-event.txt')).toBe('/events/_.txt')
    expect(shellFor('/runs/run-42/__next._tree.txt')).toBe('/runs/_/__next._tree.txt')
    expect(shellFor('/events')).toBeUndefined()
    expect(shellFor('/compliance')).toBeUndefined()
    expect(isProxied('/api/anything')).toBe(false)
  })

  it('reads the id from the URL, and none from the bare shell', () => {
    expect(idFromPath('/events/0b9f-event')).toBe('0b9f-event')
    expect(idFromPath('/runs/run%2042')).toBe('run 42')
    expect(idFromPath('/events/_')).toBe('')
  })

  it('marks staging and workers.dev noindex, never production', () => {
    expect(isNoindexHost('governance.domelayer.com', { DOME_NOINDEX: 'true' } as never)).toBe(true)
    expect(isNoindexHost('dome-governance-dashboard.x.workers.dev', {} as never)).toBe(true)
    expect(isNoindexHost('governance.domelayer.com', {} as never)).toBe(false)
  })
})
