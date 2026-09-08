const GSM7_BASIC = new Set(
  '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà',
)
const GSM7_EXTENDED = new Set('^{}\\[~]|€')

const GSM7_SINGLE = 160
const GSM7_MULTI = 153
const UCS2_SINGLE = 70
const UCS2_MULTI = 67

type SmsEncoding = 'gsm7' | 'ucs2'

type SmsSegmentInfo = {
  readonly encoding: SmsEncoding
  readonly units: number
  readonly segments: number
}

function gsm7Units(body: string): number | null {
  let units = 0
  for (const char of body) {
    if (GSM7_BASIC.has(char)) units += 1
    else if (GSM7_EXTENDED.has(char)) units += 2
    else return null
  }
  return units
}

export function smsSegments(body: string): SmsSegmentInfo {
  const gsm = gsm7Units(body)
  const encoding: SmsEncoding = gsm === null ? 'ucs2' : 'gsm7'
  const units = gsm ?? [...body].length
  const single = encoding === 'gsm7' ? GSM7_SINGLE : UCS2_SINGLE
  const multi = encoding === 'gsm7' ? GSM7_MULTI : UCS2_MULTI
  if (units === 0) return { encoding, units, segments: 0 }
  const segments = units <= single ? 1 : Math.ceil(units / multi)
  return { encoding, units, segments }
}
