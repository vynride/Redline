import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
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
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
