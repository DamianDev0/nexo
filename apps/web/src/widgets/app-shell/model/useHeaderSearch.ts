import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export function useHeaderSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const navigate = useCallback(
    (url: string) => {
      setOpen(false)
      router.push(url)
    },
    [router],
  )

  return { open, setOpen, navigate }
}
