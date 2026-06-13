import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// Plus Jakarta Sans is the app-wide sans. It's bound to `--font-inter` (the variable
// Tailwind's `font-sans` resolves to) so the whole product, marketing pages, and any
// portaled overlays switch over without touching the design tokens.
const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

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
    <html lang="en" className={`${sans.variable} ${jetbrains.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
