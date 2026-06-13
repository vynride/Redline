import type { Metadata } from "next";
// Fonts are bundled from npm (@fontsource) rather than fetched from Google Fonts at
// build time, so the image builds in network-restricted environments. The CSS imports
// register the @font-face rules; the families are wired to --font-inter / --font-jetbrains
// (the variables Tailwind's font-sans / font-mono resolve to) in globals.css.
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Redline :: Crisis-drill voice trainer",
  description:
    "Redline drops you into a live incident and makes you talk your way out. AI roleplays the other side; you get coached on the recording.",
  manifest: "/site.webmanifest",
  // Favicon, .ico and apple-touch icons are emitted from the app/icon.svg,
  // app/favicon.ico and app/apple-icon.png file conventions automatically.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
