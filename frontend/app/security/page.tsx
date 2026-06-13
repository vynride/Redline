import type { Metadata } from "next";
import { InfoPage } from "@/components/landing/InfoPage";

export const metadata: Metadata = { title: "Security :: Redline" };

export default function SecurityPage() {
  return (
    <InfoPage
      eyebrow="Company"
      title="Security"
      updated="May 2026"
      intro="We treat the trust you place in Redline as the product. Here is a plain-language summary of how we protect your account and your drill data."
      sections={[
        {
          heading: "Data in transit and at rest",
          body: [
            "All traffic runs over TLS 1.2+. Drill transcripts, scores, and account details are encrypted at rest with AES-256.",
            "Secrets and API keys live in a managed secrets store, never in source control, and are rotated on a regular schedule.",
          ],
        },
        {
          heading: "Your voice stays yours",
          body: [
            "Microphone audio is streamed for transcription and is not retained after a turn is processed. We keep the text transcript so you can review your debrief; we do not keep the raw recording.",
            "We never sell your data, and we do not use your drills to train third-party models.",
          ],
        },
        {
          heading: "Accounts and access",
          body: [
            "Sign-in is handled through trusted OAuth providers, so we never see your password. Internal access to production is least-privilege and logged.",
          ],
        },
        {
          heading: "Reporting an issue",
          body: [
            "Found something that looks off? Email vynride@gmail.com with the details and we will get back to you quickly. Responsible disclosure is always welcome.",
          ],
        },
      ]}
    />
  );
}
