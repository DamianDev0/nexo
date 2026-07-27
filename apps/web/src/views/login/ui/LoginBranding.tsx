import { LoginOrb } from './LoginOrb'

export function LoginBranding() {
  return (
    <div className="relative z-3 flex h-full w-full items-center justify-end py-16 lg:pr-16 xl:pr-28">
      <div className="flex flex-col items-center gap-7">
        <div className="translate-x-8 shrink-0">
          <LoginOrb />
        </div>
        <div className="flex flex-col gap-2 text-center">
          <h2 className="text-3xl font-light text-foreground">
            Welcome back, <em className="italic text-foreground/35">let&apos;s close deals.</em>
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your team is waiting.
            <br />
            Pick up where you left off.
          </p>
        </div>
      </div>
    </div>
  )
}
