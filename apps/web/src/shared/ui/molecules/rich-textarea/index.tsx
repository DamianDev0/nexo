'use client'

import { useEffect } from 'react'

import { cn } from '@/shared/lib'

import type { RichEditor } from './useRichEditor'
import type { FormEvent } from 'react'

export { useRichEditor } from './useRichEditor'
export type { RichCommandState, RichEditor } from './useRichEditor'

type RichTextAreaProps = {
  readonly editor: RichEditor
  readonly onChange: (html: string) => void
  readonly placeholder?: string
  readonly autoFocus?: boolean
  readonly className?: string
}

export function RichTextArea({
  editor,
  onChange,
  placeholder,
  autoFocus,
  className,
}: Readonly<RichTextAreaProps>) {
  useEffect(() => {
    if (autoFocus) editor.ref.current?.focus()
  }, [autoFocus, editor.ref])

  const handleInput = (event: FormEvent<HTMLDivElement>) => {
    const html = event.currentTarget.innerHTML
    onChange(html === '<br>' ? '' : html)
  }

  return (
    <div
      ref={editor.ref}
      contentEditable
      role="textbox"
      aria-multiline="true"
      data-slot="rich-textarea"
      data-placeholder={placeholder}
      onInput={handleInput}
      onBlur={editor.saveSelection}
      className={cn(
        'min-h-32 w-full text-sm leading-relaxed break-words whitespace-pre-wrap outline-none',
        'empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]',
        '[&_a]:text-primary [&_a]:underline',
        '[&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5',
        className,
      )}
    />
  )
}
