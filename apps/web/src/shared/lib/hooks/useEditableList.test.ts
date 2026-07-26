import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useEditableList } from './useEditableList'

interface Item {
  name: string
  value: number
}

const initial: Item[] = [
  { name: 'a', value: 1 },
  { name: 'b', value: 2 },
]

function makeItem(): Item {
  return { name: 'new', value: 0 }
}

describe('useEditableList', () => {
  it('assigns a stable unique id to every initial item', () => {
    const { result } = renderHook(() => useEditableList(initial, makeItem))
    const ids = result.current.items.map((item) => item.id)

    expect(ids).toHaveLength(2)
    expect(new Set(ids).size).toBe(2)
    ids.forEach((id) => expect(id).toBeTruthy())
  })

  it('adds a new item with its own id', () => {
    const { result } = renderHook(() => useEditableList(initial, makeItem))

    act(() => result.current.add())

    expect(result.current.items).toHaveLength(3)
    expect(result.current.items[2]).toMatchObject({ name: 'new', value: 0 })
    expect(result.current.items[2]?.id).not.toBe(result.current.items[0]?.id)
  })

  it('removes only the item with the given id', () => {
    const { result } = renderHook(() => useEditableList(initial, makeItem))
    const [first] = result.current.items

    act(() => result.current.remove(first!.id))

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0]?.name).toBe('b')
  })

  it('updates only the item with the given id', () => {
    const { result } = renderHook(() => useEditableList(initial, makeItem))
    const [first, second] = result.current.items

    act(() => result.current.update(first!.id, { value: 99 }))

    expect(result.current.items[0]).toMatchObject({ name: 'a', value: 99 })
    expect(result.current.items[1]).toMatchObject({ name: 'b', value: second!.value })
  })

  it('keeps ids intact after an update', () => {
    const { result } = renderHook(() => useEditableList(initial, makeItem))
    const idBefore = result.current.items[0]!.id

    act(() => result.current.update(idBefore, { name: 'renamed' }))

    expect(result.current.items[0]?.id).toBe(idBefore)
  })
})
