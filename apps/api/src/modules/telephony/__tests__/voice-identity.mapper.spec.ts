import {
  decodeVoiceIdentity,
  encodeVoiceIdentity,
  identityFromClientAddress,
} from '../mappers/voice-identity.mapper'

const TENANT_ID = '0b3f2a1c-4d5e-4f60-8a71-92b3c4d5e6f7'
const USER_ID = 'f7e6d5c4-b3a2-4918-8776-655443322110'

describe('voice identity mapper', () => {
  it('encodes tenant and user as a Twilio-safe identity', () => {
    const identity = encodeVoiceIdentity(TENANT_ID, USER_ID)
    expect(identity).toMatch(/^t[0-9a-f]{32}_u[0-9a-f]{32}$/)
    expect(identity).not.toContain('-')
  })

  it('round-trips tenant and user ids', () => {
    expect(decodeVoiceIdentity(encodeVoiceIdentity(TENANT_ID, USER_ID))).toEqual({
      tenantId: TENANT_ID,
      userId: USER_ID,
    })
  })

  it('rejects malformed identities', () => {
    expect(decodeVoiceIdentity('tenant_123:user_456')).toBeNull()
    expect(decodeVoiceIdentity('')).toBeNull()
    expect(decodeVoiceIdentity(`t${'z'.repeat(32)}_u${'0'.repeat(32)}`)).toBeNull()
  })

  it('throws on invalid UUID input', () => {
    expect(() => encodeVoiceIdentity('not-a-uuid', USER_ID)).toThrow(TypeError)
  })

  it('extracts identity from a client address', () => {
    expect(identityFromClientAddress('client:abc')).toBe('abc')
    expect(identityFromClientAddress('+573001234567')).toBeNull()
    expect(identityFromClientAddress(undefined)).toBeNull()
  })
})
