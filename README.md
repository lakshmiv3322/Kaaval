# Kaaval – Real-Time Scam Call Shield with LUMAE-Style UI & ShaderGradient 3D

> **One-Line Pitch:** While an elderly person is on a suspicious call, Kaaval listens in real time, spots deceptive "Digital Arrest" coercion scripts in their native language, warns them on screen, and alerts family members who can join the call with one tap.

---

## 🌟 Hackathon Presentation Highlights

1. **LUMAE-Grade Editorial Aesthetics:**
   - Deep navy-black canvas (`#0B0F14`), rich card surfaces (`#121821`), and electric accent (`#5B8FFF`).
   - Clean typographic pairing using Inter and JetBrains Mono.
   - Smooth continuous transitions and generous whitespace.

2. **ShaderGradient-Style WebGL & Three.js 3D Sentinels:**
   - **Hero WebGL Shader:** Custom multi-frequency Simplex/Perlin noise GLSL shader with rich warm-to-cool gradient blending (`#ff5005`, `#dbba95`, `#5B8FFF`, `#0B0F14`) and subtle procedural film grain.
   - **3D Emissive Shield:** Interactive Three.js extruded shield mesh rotating continuously on the Y-axis and dynamically shifting emissive color (Emerald Green → Amber Warning → Crimson Alert) as risk intensifies.
   - **Risk Aura Shader:** Dynamic radial energy aura behind the threat meter.

3. **Multi-Language Regional Warnings:**
   - High-contrast, large-format warnings in **Tamil (தமிழ்)**, **Hindi (हिंदी)**, **Telugu (తెలుగు)**, and **English**.
   - Explicitly debunks "Digital Arrest", emphasizing that Indian police never conduct video bail or request OTP transfers.

4. **Multi-Screen Real-Time Sync & One-Tap Barge-In:**
   - Cross-tab `BroadcastChannel` synchronization between the **Elder Screen** (`/demo/elder`) and **Family Guardian Hub** (`/demo/family`).
   - Includes **Split Judge View** (`/demo/split`) for instant side-by-side presentation.
   - One-tap emergency 3-way conference bridge with automated legal warning broadcast and remote line termination.

5. **Post-Call Evidence Pack & Complaint Generation:**
   - Generates and exports formal complaint packs formatted for the **National Cyber Crime Helpline (1930)** and RBI Bank Dispute systems.

---

## 🚀 Live Demo Flow for Judges (3-Minute Tour)

1. **Overview (Landing Page):**
   - Open `/` to showcase the LUMAE layout, interactive ShaderGradient hero, and 3D rotating shield.
   - Scroll through the 3-step *How It Works* cards and preview the mini-dashboard.

2. **Start Simulated Scam Call:**
   - Navigate to `/demo/elder` (or `/demo/split` for side-by-side mode).
   - Select the scenario: `"CBI / Mumbai Police 'Digital Arrest' Scam"`.
   - Click **Simulate Incoming Call**.
   - Observe the live transcript appearing, tactic chips lighting up (*Authority Claim*, *Urgency*, *Digital Arrest Demand*), and the 3D shield glowing red as the risk meter climbs to `92/100`.
   - Note the high-contrast Tamil / Hindi warning banner appearing on screen.

3. **Family Alert & Barge-In:**
   - On `/demo/family`, see the urgent red alert banner trigger with a transcript summary.
   - Click **Call Mom Now (Barge In)** to launch the 3-way rescue conference modal.
   - Click **Broadcast Police Warning** or **Force Disconnect Scammer**.

4. **Forensic Evidence Pack:**
   - Navigate to `/demo/evidence/call-1049`.
   - Review the tactic timeline, verbatim transcript, and click **Download Complaint Pack (PDF)** to generate the official complaint dossier.

---

## 🛠️ Architecture & Plugging in Real STT / LLM Later

- **Speech-to-Text (STT):**
  - Located in `src/pages/ElderScreen.tsx` and `server.ts` (`POST /demo/call/transcript`).
  - To connect real-time Whisper / Deepgram / Google Cloud Speech:
    ```typescript
    // Replace simulation ticker with MediaRecorder Web Audio API stream:
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stream chunks over WebSocket to your Whisper / Speech-to-Text endpoint.
    ```

- **LLM Tactic Classification:**
  - Located in `server.ts` (`POST /demo/call/analyze`).
  - Supports `@google/genai` (Gemini 2.5 Flash) via `process.env.GEMINI_API_KEY`.
  - Also includes offline fallback heuristics mapping keywords (`"digital arrest"`, `"section 420"`, `"skype"`, `"otp"`).

---

## 🏃 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```
