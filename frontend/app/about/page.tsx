import type { Metadata } from "next";
import { InfoPage } from "@/components/landing/InfoPage";

export const metadata: Metadata = { title: "About :: Redline" };

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="Company"
      title="About Redline"
      updated="May 2026"
      intro="Redline is a voice-first crisis-drill trainer. We drop you into a live incident, make you talk your way out loud, and coach you on every word once the call is over."
      sections={[
        {
          heading: "Why we built it",
          body: [
            "The first time most responders handle a real outage, a furious customer, or a security scare is during the real thing. The playbook is on a wiki nobody opened, and the pressure does the rest.",
            "Redline turns that first time into the hundredth. You practise the conversation, out loud, against an AI that pushes back the way a stressed stakeholder actually does, until staying calm under pressure becomes muscle memory.",
          ],
        },
        {
          heading: "How it works",
          body: [
            "Pick a scenario or describe your own. An AI persona opens the incident and reacts, turn by turn, to how well you lead. Severity rises when you hedge and falls when you take control.",
            "When the call ends you get a debrief: a grade, a breakdown across clarity, de-escalation, information gathering, escalation, and status communication, and the exact moments you lost control with stronger rewrites.",
          ],
        },
        {
          heading: "Who we are",
          body: [
            "Redline is built by vynride, a small studio that ships focused tools for people who operate under pressure. We care about realism, fast feedback, and never wasting your time.",
          ],
        },
      ]}
    />
  );
}
