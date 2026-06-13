export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink">
      {/* Ambient radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(52% 52% at 50% 50%, rgba(124,58,237,0.1) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-12">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Redline" width={28} height={28} className="h-7 w-7" />
          <span className="text-[1.05rem] font-semibold tracking-[0.12em] text-white">
            REDLINE
          </span>
        </div>

        {/* Radar rings */}
        <div className="relative flex h-40 w-40 items-center justify-center">
          {/* Outermost pulse ring */}
          <div
            className="absolute h-36 w-36 rounded-full border border-violet-500/20 animate-ping"
            style={{ animationDuration: "2.4s", animationDelay: "0s" }}
          />
          {/* Middle pulse ring */}
          <div
            className="absolute h-24 w-24 rounded-full border border-violet-400/30 animate-ping"
            style={{ animationDuration: "2.4s", animationDelay: "0.8s" }}
          />
          {/* Inner pulse ring */}
          <div
            className="absolute h-12 w-12 rounded-full border border-violet-300/50 animate-ping"
            style={{ animationDuration: "2.4s", animationDelay: "1.6s" }}
          />
          {/* Static base ring for visual anchor */}
          <div className="absolute h-36 w-36 rounded-full border border-violet-900/25" />
          {/* Center glow dot */}
          <div
            className="h-2.5 w-2.5 rounded-full bg-accent"
            style={{
              boxShadow:
                "0 0 16px 5px rgba(167,139,250,0.55), 0 0 36px 12px rgba(167,139,250,0.18)",
            }}
          />
        </div>

        {/* Status text with trailing dots */}
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs tracking-[0.22em] text-muted uppercase">
            Establishing Signal
          </span>
          <span className="flex items-center gap-1">
            {[0, 0.3, 0.6].map((delay, i) => (
              <span
                key={i}
                className="inline-block h-[3px] w-[3px] rounded-full bg-muted animate-pulse"
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}
