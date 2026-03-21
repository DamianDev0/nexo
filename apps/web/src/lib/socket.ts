import { io, type Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:8080'

let socket: Socket | null = null

export function getSocket(token?: string): Socket {
  if (socket?.connected) return socket

  socket = io(`${SOCKET_URL}/notifications`, {
    transports: ['websocket', 'polling'],
    auth: token ? { token } : undefined,
    autoConnect: false,
  })

  return socket
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
