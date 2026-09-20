# Kaaval (காவல்) — Autonomous Scam Call Shield for Elders

> **Keep the conversation open.** Kaaval is an autonomous telephony defense system protecting elderly citizens in India from "Digital Arrest", courier narcotics extortion, and coercive imposter scams by analyzing call transcripts in real-time, masking private PII, and bridging family members onto the line.

---

## Real vs. Simulated Capabilities

In accordance with transparent engineering principles, the table below delineates which subsystems execute real production code versus labeled simulations:

| Capability | Status | Implementation Details |
| :--- | :--- | :--- |
| **PII Redaction Engine** | **REAL** | Deterministic on-device regex strips 12-digit Aadhaar runs, bank accounts, 6-digit OTPs, and phone numbers before any model inference or transmission (`src/services/redaction.ts`). |
| **Multilingual Heuristic Engine** | **REAL** | Fast regex-based threat engine scoring authority claims, secrecy demands, and legal urgency across Tamil, Hindi, Tanglish, and English in **&lt; 1 ms** (`src/services/detector.ts`). |
| **Verbatim Quote Verification** | **REAL** | `validateVerbatimQuotes` verifies that every flagged tactic quote is an exact character-for-character substring of the caller's utterances, eliminating LLM hallucinations (`src/services/detector.ts`). |
| **Hybrid Gemini 3.8 Flash Engine** | **REAL** | Express backend proxies redacted transcripts to `@google/genai` with strict JSON schema outputs and fallback to on-device heuristics (`server.ts`). |
| **Benchmark Evaluation Suite** | **REAL** | 65 labeled synthetic transcripts benchmarked via `npm run eval` across precision, recall, F1, latency, and confusion matrix (`/eval/dataset.json`, `/demo/eval`). |
| **Cybercrime Complaint PDF Export** | **REAL** | Generates true client-side downloadable PDF dossiers via `jspdf` formatted for National Cyber Crime Reporting Portal (1930 / cybercrime.gov.in) with Section 65B Indian Evidence Act certification (`src/pages/EvidencePackPage.tsx`). |
| **Cross-Device Event Synchronization** | **REAL** | Server-Sent Events (SSE) bus at `/api/events` with 6-digit pairing code matching (`src/services/syncChannel.ts`, `server.ts`). |
| **DTMF Audio & Speech Feedback** | **REAL** | Browser Web Audio API dual-frequency sine wave synthesis (941Hz + 1336Hz) and Web Speech API synthesis for regional voice warnings (`src/components/modals/BargeInModal.tsx`). |
| **Telecom Call Interception** | **SIMULATED** | Audio input is sourced via browser Web Speech API (real live microphone) or deterministic scenario scripts. Full telco IMS/SIP switch integration is detailed in `/how-it-deploys`. |
| **Twilio 3-Way Conference Barge-in** | **HYBRID** | Executes real 3-way conference calls when `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` are configured; otherwise cleanly degrades to a labeled **Simulation Mode** with a visual badge and audio tone (`server.ts`). |

---

## Benchmark Results (65-Transcript Dataset)

Run `npm run eval` to execute the automated benchmark:

- **Accuracy:** `90.8%` (59 / 65 test cases correctly classified)
- **Precision:** `100.0%` (Zero false alarms on benign family calls)
- **Recall:** `87.5%` (Catches coercive extortions in under 3 dialogue turns)
- **F1 Score:** `93.3%`
- **False Positive Rate (FPR):** `0.0%`
- **Rule Engine Latency:** `&lt; 1 ms`
- **Gemini Hybrid Latency:** `~925 ms`

---

## Demo & Evaluation Routes

| Route | Purpose |
| :--- | :--- |
| `/` | Product landing page & editorial story |
| `/demo/elder` | Protected elder dialer interface with live microphone STT and scenario player |
| `/demo/family` | Family Guardian Hub with real-time alert stream and 6-digit pairing code |
| `/demo/split` | Dual-screen presentation view (Elder Phone + Family Dashboard) |
| `/demo/eval` | Benchmark results: confusion matrix, ROC tradeoffs, test case inspector |
| `/demo/judge` | Interactive evaluator test bench with custom transcript editor & preset attacks |
| `/demo/evidence/:id` | Section 65B Cybercrime Evidence Dossier with real PDF download |
| `/how-it-deploys` | Technical deployment architectures (Telco SIP, Android OS, Accessibility VoIP) |
| `/privacy` | Zero-PII privacy guarantee & DPDP Act 2023 compliance breakdown |

---

## Local Development & Testing

```bash
# Install dependencies
npm install

# Run unit tests (19 assertions)
npm test

# Run the 65-transcript evaluation benchmark
npm run eval

# Start local full-stack dev server
npm run dev

# Build production bundle
npm run build
```
