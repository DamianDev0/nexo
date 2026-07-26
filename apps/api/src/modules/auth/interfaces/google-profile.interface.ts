export interface GoogleProfile {
  email: string
  fullName: string
  avatarUrl: string | null
  slug: string
}

export interface GoogleOAuthState {
  slug: string
}
