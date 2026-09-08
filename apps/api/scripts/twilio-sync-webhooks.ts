import 'dotenv/config'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import twilio from 'twilio'
import { appConfig } from '../src/config/app.config'
import { VOICE_WEBHOOK_PATH } from '../src/modules/telephony/constants/call.constants'

async function main(): Promise<void> {
  const baseUrl = (process.argv[2] ?? process.env.TWILIO_WEBHOOK_BASE_URL ?? '').replace(/\/$/, '')
  if (!/^https:\/\//.test(baseUrl)) {
    throw new Error('Usage: pnpm twilio:webhooks https://<public-host>  (ngrok or production URL)')
  }

  const appSid = process.env.TWILIO_TWIML_APP_SID
  if (!appSid) throw new Error('TWILIO_TWIML_APP_SID is not set')

  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  const hook = (path: string) => `${baseUrl}/${appConfig().apiPrefix}/${VOICE_WEBHOOK_PATH}/${path}`

  const app = await client.applications(appSid).update({
    voiceUrl: hook('voice'),
    voiceMethod: 'POST',
    voiceFallbackUrl: hook('voice-fallback'),
    voiceFallbackMethod: 'POST',
    statusCallback: hook('status'),
    statusCallbackMethod: 'POST',
  })

  const envPath = resolve(__dirname, '../.env')
  const env = readFileSync(envPath, 'utf8')
  const next = env.replace(/^TWILIO_WEBHOOK_BASE_URL=.*$/m, `TWILIO_WEBHOOK_BASE_URL=${baseUrl}`)
  writeFileSync(envPath, next)

  console.log(`TwiML App ${app.friendlyName} → ${app.voiceUrl}`)
  console.log(`.env TWILIO_WEBHOOK_BASE_URL=${baseUrl}  (restart the API to apply)`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
