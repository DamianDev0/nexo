export interface GoogleProfile {
  email: string
  fullName: string
  avatarUrl: string | null
  slug: string
}

/** Shape of the base64-encoded JSON state passed through the OAuth redirect */
export interface GoogleOAuthState {
  slug: string
}
