import { DEFAULT_PLAN_LABEL } from '../config/sidebar.constants'

import type { SidebarTeam, SidebarUser } from '../model/types'
import type { SessionUser } from '@/entities/session'

export function toSidebarUser(user: SessionUser | null): SidebarUser {
  return {
    name: user?.fullName?.trim() || (user?.email?.split('@')[0] ?? ''),
    email: user?.email ?? '',
    avatarUrl: user?.avatarUrl ?? null,
  }
}

export function toSidebarTeam(branding: { name: string; plan: string | null }): SidebarTeam {
  return {
    name: branding.name,
    plan: branding.plan ?? DEFAULT_PLAN_LABEL,
  }
}

export function teamInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?'
}
