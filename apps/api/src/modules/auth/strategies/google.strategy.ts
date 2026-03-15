import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'
import { Strategy, type Profile, type VerifyCallback } from 'passport-google-oauth20'
import type { Request } from 'express'
import type { GoogleProfile, GoogleOAuthState } from '../interfaces/google-profile.interface'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.getOrThrow<string>('app.googleClientId'),
      clientSecret: config.getOrThrow<string>('app.googleClientSecret'),
      callbackURL: config.getOrThrow<string>('app.googleCallbackUrl'),
      scope: ['email', 'profile'],
      passReqToCallback: true,
    })
  }

  // Called by passport after Google redirects back
  validate(
    req: Request,
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const email = profile.emails?.[0]?.value
    if (!email) {
      return done(new UnauthorizedException('Google account has no email address'), false)
    }

    // Tenant slug was encoded in the OAuth state param at initiation
    const rawState = req.query['state']
    const stateStr = Array.isArray(rawState) ? rawState[0] : rawState

    let slug: string | undefined
    if (typeof stateStr === 'string') {
      try {
        const decoded = JSON.parse(Buffer.from(stateStr, 'base64').toString()) as GoogleOAuthState
        slug = decoded?.slug
      } catch {
        // malformed state — treated as missing
      }
    }

    if (!slug) {
      return done(new UnauthorizedException('Missing tenant context in OAuth state'), false)
    }

    const googleProfile: GoogleProfile = {
      email,
      fullName: profile.displayName ?? email,
      avatarUrl: profile.photos?.[0]?.value ?? null,
      slug,
    }

    done(null, googleProfile)
  }
}
