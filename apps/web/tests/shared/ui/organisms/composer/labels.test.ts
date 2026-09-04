import { describe, expect, it } from 'vitest'

import { buildComposerControlLabels } from '@/shared/ui/organisms/composer'

const t = ((key: string) => key) as never

describe('buildComposerControlLabels', () => {
  it('builds the window control labels from the generic composer namespace', () => {
    expect(buildComposerControlLabels(t)).toEqual({
      minimize: 'composer.controls.minimize',
      expand: 'composer.controls.expand',
      close: 'composer.controls.close',
      drag: 'composer.controls.drag',
    })
  })
})
