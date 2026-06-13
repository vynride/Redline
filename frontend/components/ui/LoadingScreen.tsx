export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink">
      {/* Subtle ambient glow centred on content */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(38% 38% at 50% 50%, rgba(124,58,237,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Content, fades up on mount */}
      <div
        className="flex flex-col items-center gap-10"
        style={{ animation: "redline-fade-up 0.65s ease-out forwards" }}
      >
        {/* Brand, glow breathes slowly */}
        <div
          className="flex items-center gap-2.5"
          style={{ animation: "redline-glow-breathe 3s ease-in-out infinite 0.65s" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Redline" width={30} height={30} className="h-[30px] w-[30px]" />
          <span className="text-[1.05rem] font-semibold tracking-[0.12em] text-white">
            REDLINE
          </span>
        </div>

        {/* Shimmer bar */}
        <div className="relative h-px w-44 overflow-hidden rounded-full bg-violet-950/50">
          <div
            className="absolute inset-y-0 left-0 w-1/2 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, #A78BFA 50%, transparent 100%)",
              animation: "redline-shimmer 2s ease-in-out infinite",
            }}
          />
        </div>

        {/* Status */}
        <span
          className="font-mono text-[10px] tracking-[0.3em] uppercase"
          style={{ color: "rgba(111,103,137,0.55)" }}
        >
          Stand By
        </span>
      </div>
    </div>
  );
}
