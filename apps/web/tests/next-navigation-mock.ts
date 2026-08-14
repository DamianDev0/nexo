import { useSyncExternalStore } from 'react'

const listeners = new Set<() => void>()
const cache = new Map<string, URLSearchParams>()
let search = ''

function read() {
  return search
}

function write(next: string) {
  search = next
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function setUrl(next: string) {
  write(next)
}

export function resetUrl() {
  write('')
}

export function currentUrl() {
  return search
}

export function usePathname() {
  return '/contacts'
}

export function useRouter() {
  const navigate = (url: string) => write(url.split('?')[1] ?? '')
  return { replace: navigate, push: navigate, refresh: () => undefined }
}

export function useSearchParams() {
  const value = useSyncExternalStore(subscribe, read, read)
  const cached = cache.get(value)
  if (cached) return cached
  const params = new URLSearchParams(value)
  cache.set(value, params)
  return params
}
