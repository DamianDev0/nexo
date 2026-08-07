const AVATAR_GRADIENTS = [
  'bg-radial-[at_40%_80%] from-indigo-600 via-blue-400 to-sky-200',
  'bg-radial-[at_45%_80%] from-rose-600 via-purple-500 to-fuchsia-200',
  'bg-radial-[at_50%_70%] from-red-600 via-orange-400 to-orange-200',
  'bg-radial-[at_40%_75%] from-teal-500 via-emerald-400 to-lime-200',
  'bg-radial-[at_45%_80%] from-amber-600 via-amber-400 to-yellow-100',
  'bg-radial-[at_40%_80%] from-cyan-600 via-sky-400 to-cyan-100',
] as const

export function avatarGradient(seed: string): string {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) % 997
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length] ?? AVATAR_GRADIENTS[0]
}
