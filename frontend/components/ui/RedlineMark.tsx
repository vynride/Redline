/**
 * The Redline distress-flake glyph as a single-colour mark (inherits `currentColor`),
 * so it can be tinted white / rose / violet wherever the brand icon is needed, * e.g. inside the live drill's call button. The full-colour wordmark lives in
 * /public/logo.svg; this is the recolourable inline version.
 */
export function RedlineMark({ className }: { className?: string }) {
  return (
    <svg viewBox="4 4 248 248" fill="currentColor" className={className} role="img" aria-label="Redline">
      <path
        d="M 143.31,91.04 L 164.96,112.69 L 164.96,143.31 L 143.31,164.96 L 112.69,164.96 L 91.04,143.31 L 91.04,112.69 L 112.69,91.04 Z M 117.28,102.13 L 102.13,117.28 L 102.13,138.72 L 117.28,153.87 L 138.72,153.87 L 153.87,138.72 L 153.87,117.28 L 138.72,102.13 Z"
        fillRule="evenodd"
      />
      {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((deg) => (
        <g key={deg} transform={`rotate(${deg} 128 128)`}>
          <path d="M 128,38 L 139.07,71.07 L 128,88 L 116.93,71.07 Z" />
        </g>
      ))}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <g key={deg} transform={`rotate(${deg} 128 128)`}>
          <path d="M 128,4 L 134.78,56.32 L 128,84 L 121.22,56.32 Z" />
          <path d="M 128,34 L 138.03,48.63 L 128,62 L 117.97,48.63 Z" />
        </g>
      ))}
    </svg>
  );
}
