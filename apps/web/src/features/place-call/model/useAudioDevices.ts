'use client'

import { useEffect, useState } from 'react'

import type { AudioDeviceOption } from './types/call.types'

type AudioDeviceLists = {
  readonly mics: readonly AudioDeviceOption[]
  readonly outputs: readonly AudioDeviceOption[]
}

const emptyLists: AudioDeviceLists = { mics: [], outputs: [] }

function toOption(device: MediaDeviceInfo, index: number, fallback: string): AudioDeviceOption {
  return {
    id: device.deviceId,
    label: device.label === '' ? `${fallback} ${index + 1}` : device.label,
  }
}

export function useAudioDevices(fallbackLabel: string): AudioDeviceLists {
  const [lists, setLists] = useState<AudioDeviceLists>(emptyLists)

  useEffect(() => {
    const media = navigator.mediaDevices
    if (typeof media?.enumerateDevices !== 'function') return
    let cancelled = false
    const refresh = async () => {
      try {
        const devices = await media.enumerateDevices()
        if (cancelled) return
        const usable = devices.filter((device) => device.deviceId !== '')
        setLists({
          mics: usable
            .filter((device) => device.kind === 'audioinput')
            .map((device, index) => toOption(device, index, fallbackLabel)),
          outputs: usable
            .filter((device) => device.kind === 'audiooutput')
            .map((device, index) => toOption(device, index, fallbackLabel)),
        })
      } catch {
        if (!cancelled) setLists(emptyLists)
      }
    }
    void refresh()
    media.addEventListener?.('devicechange', refresh)
    return () => {
      cancelled = true
      media.removeEventListener?.('devicechange', refresh)
    }
  }, [fallbackLabel])

  return lists
}
