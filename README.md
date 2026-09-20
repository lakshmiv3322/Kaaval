# Kaaval

> **Keep the conversation open.** Kaaval is a browser-based prototype that helps families recognize coercive scam calls and join the conversation before pressure becomes a payment.

## What Is Included

- **Editorial landing page:** A dark near-black interface with electric blue accents, Instrument Serif display moments, Geist body text, and Geist Mono for timers and scores.
- **Live hero phone simulation:** An 18-second CSS phone loop shows an unknown caller, scripted transcript lines, a risk ring moving from 10 to 92, tactic chips, a scam warning, and a family-join notification. It pauses off-screen and shows its final alert frame with reduced motion enabled.
- **The Ninety Seconds:** A scroll-driven five-step story showing how a digital-arrest scam escalates from an unknown call to a family bridge. Reduced motion renders the story as a normal list.
- **Feature bento:** Language samples in Tamil, Hindi, Telugu, and English; explainable risk factors; one-tap family joining; evidence preview; a labelled demo tactic-library count; and an elder-friendly “Call my child” control.
- **Interactive scam anatomy:** Tap highlighted phrases to reveal the authority claim, arrest threat, and secrecy demand behind the script. The risk bar updates as phrases are revealed.
- **Proof section:** Uses clearly marked placeholders until verified figures or benchmark results are available. No unsupported statistics are presented as fact.

## Demo Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page and product story |
| `/demo/elder` | Elder call screen and scripted scenario player |
| `/demo/family` | Family Guardian Hub with alert feed and recent-call timeline |
| `/demo/split` | Side-by-side elder and family presentation view |
| `/demo/evidence/call-1049` | Paper-style evidence and complaint workspace |

## Three-Minute Demo Flow

1. Open `/demo/split`.
2. On the elder screen, click **Simulate Incoming Call**. The CBI / Mumbai Police “Digital Arrest” scenario is selected by default.
3. Watch the transcript, tactic chips, and risk score progress toward `92/100`.
4. When risk crosses 65, the elder screen shows a high-contrast regional warning. Sound feedback is muted until the page has received user interaction and can be disabled with the visible toggle.
5. On the family screen, confirm one **Possible scam call** notification with the risk score, reasons, and actions **Join the call** and **Send voice warning**.
6. Use **Send voice warning** to send the existing Tamil warning through the synchronized demo channel. The elder screen displays the toast and attempts browser speech synthesis.
7. Choose **Join the call**, then use the force-disconnect action in the bridge modal. The elder call ends and shows the safe termination state.
8. Open the evidence pack to review the transcript, tactic markers, scrubber, and complaint export.

## Privacy And Prototype Notes

- The landing page describes the intended product experience as listening through browser speech recognition. The current demo flow is a scripted scenario player, not a production call interception system.
- The interface uses the honest statement: **No audio saved by Kaaval.**
- The evidence export is a browser-generated text complaint pack despite the prototype button label referencing a complaint PDF. Verify all details before filing at [cybercrime.gov.in](https://cybercrime.gov.in) or through the **1930** helpline.
- The project is a hackathon prototype and is not a substitute for reporting fraud or contacting emergency services.

## Architecture

- `src/pages/LandingPage.tsx` composes the landing experience.
- `src/components/landing/` contains the hero, phone mockup, scroll story, and bento feature sections.
- `src/pages/ElderScreen.tsx` runs the existing scenario player and publishes synchronized call updates.
- `src/pages/FamilyDashboard.tsx` listens for alerts and publishes family actions.
- `src/services/syncChannel.ts` owns the cross-screen message bus.
- `src/services/scamScenarios.ts` contains the scripted digital-arrest, customs, and safe-call presets.
- `src/pages/EvidencePackPage.tsx` renders the evidence document and complaint export.

The demo uses React, Vite, Tailwind CSS 4, Motion, Three.js, and Lucide icons. No additional dependencies are required for the current experience.

## Run Locally

```bash
npm install
npm run dev
```

The development server starts at `http://localhost:3006`.

```bash
npm run lint
npm run build
```

`npm run lint` runs the TypeScript check. `npm run build` creates the Vite client bundle and bundles the server entry point.

## Honest Validation Notes

- The scripted split-demo flow has been exercised: the synchronized alert appears once, voice warning reaches the elder toast, the bridge opens, and force disconnect ends the call.
- The current production client bundle is approximately `1,065 kB` minified and `293 kB` gzip. Vite reports a large-chunk warning; no code-splitting claim is made here.
