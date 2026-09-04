export type SelectionRange = { readonly start: number; readonly end: number }

export type MarkupResult = { readonly value: string; readonly start: number; readonly end: number }

export function wrapInline(value: string, range: SelectionRange, marker: string): MarkupResult {
  const { start, end } = range
  const before = value.slice(0, start)
  const selected = value.slice(start, end)
  const after = value.slice(end)

  if (before.endsWith(marker) && after.startsWith(marker)) {
    return {
      value: before.slice(0, before.length - marker.length) + selected + after.slice(marker.length),
      start: start - marker.length,
      end: end - marker.length,
    }
  }
  if (
    selected.startsWith(marker) &&
    selected.endsWith(marker) &&
    selected.length >= marker.length * 2
  ) {
    return {
      value: before + selected.slice(marker.length, selected.length - marker.length) + after,
      start,
      end: end - marker.length * 2,
    }
  }
  return {
    value: before + marker + selected + marker + after,
    start: start + marker.length,
    end: end + marker.length,
  }
}

const NUMBERED_PREFIX = /^\d+\.\s/

function linePrefix(kind: 'bullet' | 'numbered', index: number): string {
  return kind === 'bullet' ? '- ' : `${index + 1}. `
}

function hasPrefix(kind: 'bullet' | 'numbered', line: string): boolean {
  return kind === 'bullet' ? line.startsWith('- ') : NUMBERED_PREFIX.test(line)
}

export function toggleLinePrefix(
  value: string,
  range: SelectionRange,
  kind: 'bullet' | 'numbered',
): MarkupResult {
  const lineStart = value.lastIndexOf('\n', Math.max(range.start - 1, 0)) + 1
  const segmentEnd = range.end
  const before = value.slice(0, lineStart)
  const segment = value.slice(lineStart, segmentEnd)
  const after = value.slice(segmentEnd)

  const lines = segment.split('\n')
  const allPrefixed = lines.every((line) => line === '' || hasPrefix(kind, line))

  const nextLines = lines.map((line, index) => {
    if (line === '') return line
    if (allPrefixed) {
      return kind === 'bullet' ? line.slice(2) : line.replace(NUMBERED_PREFIX, '')
    }
    return linePrefix(kind, index) + line
  })

  const nextSegment = nextLines.join('\n')
  const delta = nextSegment.length - segment.length
  const firstDelta = (nextLines[0]?.length ?? 0) - (lines[0]?.length ?? 0)

  return {
    value: before + nextSegment + after,
    start: Math.max(lineStart, range.start + firstDelta),
    end: segmentEnd + delta,
  }
}

export function insertText(value: string, range: SelectionRange, text: string): MarkupResult {
  const caret = range.start + text.length
  return {
    value: value.slice(0, range.start) + text + value.slice(range.end),
    start: caret,
    end: caret,
  }
}

const LINK_URL_PLACEHOLDER = 'https://'

export function insertLink(value: string, range: SelectionRange): MarkupResult {
  const { start, end } = range
  const selected = value.slice(start, end)
  const inserted = `[${selected}](${LINK_URL_PLACEHOLDER})`
  const urlStart = start + selected.length + 3
  return {
    value: value.slice(0, start) + inserted + value.slice(end),
    start: urlStart,
    end: urlStart + LINK_URL_PLACEHOLDER.length,
  }
}
