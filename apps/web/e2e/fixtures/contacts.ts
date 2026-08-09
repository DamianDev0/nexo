import { expect, type Page } from '@playwright/test'

import type { Workspace } from './tenant'

const API = process.env.E2E_API_URL ?? 'http://localhost:8080/api/v1'

export interface ContactSeed {
  readonly firstName: string
  readonly lastName?: string
  readonly email?: string
  readonly phone?: string
  readonly status?: string
  readonly source?: string
}

export async function seedContact(
  page: Page,
  workspace: Workspace,
  seed: ContactSeed,
): Promise<void> {
  const response = await page.request.post(`${API}/contacts`, {
    headers: { 'x-tenant-slug': workspace.slug },
    data: seed,
  })
  expect(response.status(), await response.text()).toBe(201)
}

export async function dismissDevOverlay(page: Page): Promise<void> {
  await page.evaluate(() => document.querySelector('nextjs-portal')?.remove())
}
