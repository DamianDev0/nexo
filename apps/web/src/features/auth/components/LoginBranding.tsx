import { OrbNetwork } from './OrbNetwork'

export function LoginBranding() {
  return (
    <div className="relative z-3 flex h-full flex-col items-center justify-center gap-8 py-16 pl-40 pr-0">
      {/* Orb */}
      <div className="relative size-80 shrink-0 translate-x-20 lg:size-105 lg:translate-x-36">
        <OrbNetwork />
      </div>

      {/* Tagline */}
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-3xl font-light text-foreground">
          Your pipeline, <em className="italic text-foreground/35">always on.</em>
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The CRM built for teams that move fast.
          <br />
          Close deals, not tabs.
        </p>
      </div>
    </div>
  )
}
