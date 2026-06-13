import type { Metadata } from "next";
import { InfoPage } from "@/components/landing/InfoPage";

export const metadata: Metadata = { title: "Privacy :: Redline" };

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Company"
      title="Privacy Policy"
      updated="May 2026"
      intro="This is a plain-language overview of what we collect, why, and the control you have over it. It is a placeholder summary and not yet legal advice."
      sections={[
        {
          heading: "What we collect",
          body: [
            "Account basics from your sign-in provider: your name, email, and avatar. Drill data you create: scenarios, transcripts, scores, and debriefs.",
            "Basic product analytics so we can see which scenarios are useful and where the experience breaks down.",
          ],
        },
        {
          heading: "How we use it",
          body: [
            "To run your drills, generate your debriefs, show your history and readiness, and improve the product. That is the whole list.",
            "We do not sell your data or share it with advertisers.",
          ],
        },
        {
          heading: "Your controls",
          body: [
            "You can request a copy of your data or ask us to delete your account and everything tied to it at any time by emailing vynride@gmail.com.",
          ],
        },
        {
          heading: "Third parties",
          body: [
            "We rely on a small number of processors for hosting, authentication, speech, and language models. Each only receives what it needs to do its job.",
          ],
        },
      ]}
    />
  );
}
