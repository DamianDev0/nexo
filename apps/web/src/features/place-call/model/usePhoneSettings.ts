'use client'

import { useCallStore } from './call.store'
import { useAudioDevices } from './useAudioDevices'

export function usePhoneSettings(deviceFallbackLabel: string) {
  const presence = useCallStore((state) => state.presence)
  const audio = useCallStore((state) => state.audio)
  const receiveHere = useCallStore((state) => state.receiveHere)
  const setPresence = useCallStore((state) => state.setPresence)
  const setAudioDevice = useCallStore((state) => state.setAudioDevice)
  const toggleReceiveHere = useCallStore((state) => state.toggleReceiveHere)
  const signOut = useCallStore((state) => state.signOut)
  const devices = useAudioDevices(deviceFallbackLabel)

  return {
    presence,
    audio,
    receiveHere,
    devices,
    setPresence,
    setAudioDevice,
    toggleReceiveHere,
    signOut,
  }
}
