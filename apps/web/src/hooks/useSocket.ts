import { useEffect, useRef } from 'react'
import type { Socket } from 'socket.io-client'
import { getSocket, disconnectSocket } from '@/lib/socket'

export function useSocket(token?: string): Socket | null {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!token) return

    const socket = getSocket(token)
    socketRef.current = socket

    if (!socket.connected) {
      socket.connect()
    }

    return () => {
      disconnectSocket()
      socketRef.current = null
    }
  }, [token])

  return socketRef.current
}
