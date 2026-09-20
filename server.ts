import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const PORT = 3006;
const app = express();

app.use(express.json());

// In-memory store for active and historical demo calls
let callsStore: any[] = [
  {
    id: 'call-1049',
    callerNumber: '+91 98201 44521',
    callerLabel: 'Fake Mumbai Police / CBI',
    elderName: 'Kavitha Ramaswamy (Mother)',
    elderPhone: '+91 94441 90212',
    preferredLanguage: 'ta',
    startTime: 'Today, 11:24 AM',
    durationSeconds: 142,
    status: 'ended',
    riskScore: 92,
    riskLevel: 'high-risk',
    scamType: 'Digital Arrest Impersonation',
    detectedTactics: [
      {
        id: 't-1',
        name: 'Authority Claim',
        category: 'authority',
        timestamp: '00:07',
        confidence: 0.96,
        severity: 'medium',
        quote: 'Inspector Ramesh Rathore from Crime Branch',
        description: 'Impersonating police official'
      },
      {
        id: 't-2',
        name: 'Digital Arrest Threat',
        category: 'digital_arrest',
        timestamp: '00:32',
        confidence: 0.99,
        severity: 'high',
        quote: 'You are placed under Digital Arrest. Turn on video call.',
        description: 'Coercive video confinement'
      }
    ],
    transcript: [
      { id: '1', timestamp: '00:07', speaker: 'caller', text: 'Hello Mrs. Kavitha. This is Inspector Ramesh Rathore from Crime Branch Mumbai Headquarters.' },
      { id: '2', timestamp: '00:15', speaker: 'elder', text: 'Yes? Why are you calling me? What happened?' },
      { id: '3', timestamp: '00:22', speaker: 'caller', text: 'An arrest warrant is issued in your name under Money Laundering Act Section 420.' },
      { id: '4', timestamp: '00:34', speaker: 'caller', text: 'You are placed under Digital Arrest. Turn on your video camera immediately and do not tell your family.' }
    ],
    alertTriggered: true,
    alertAcknowledged: true,
    bargeInActive: false,
    feedback: 'scam'
  }
];

let activeAlerts: any[] = [];

// Helper to lazy-init Gemini client safely
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (geminiClient) return geminiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    geminiClient = new GoogleGenAI({ apiKey });
    return geminiClient;
  }
  return null;
}

// REST API Endpoints
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Kaaval Scam Call Shield', timestamp: new Date().toISOString() });
});

// Start call session
const handleStartCall = (req: express.Request, res: express.Response) => {
  const { session } = req.body;
  const callSession = session || {
    id: `call-${Date.now().toString().slice(-4)}`,
    callerNumber: '+91 98201 44521',
    callerLabel: 'Suspected Fraud Line',
    elderName: 'Kavitha Ramaswamy',
    elderPhone: '+91 94441 90212',
    preferredLanguage: 'ta',
    startTime: 'Just now',
    durationSeconds: 0,
    status: 'in-progress',
    riskScore: 15,
    riskLevel: 'safe',
    detectedTactics: [],
    transcript: [],
    alertTriggered: false,
    alertAcknowledged: false,
    bargeInActive: false,
  };

  callsStore.unshift(callSession);
  res.json({ success: true, session: callSession });
};

app.post('/api/demo/call/start', handleStartCall);
app.post('/demo/call/start', handleStartCall);

// Send transcript chunks
const handleTranscript = (req: express.Request, res: express.Response) => {
  const { callId, chunk } = req.body;
  const call = callsStore.find((c) => c.id === callId);
  if (call) {
    call.transcript.push(chunk);
    if (chunk.tacticFlag && !call.detectedTactics.some((t: any) => t.name === chunk.tacticFlag)) {
      call.detectedTactics.push({
        id: `t-${Date.now()}`,
        name: chunk.tacticFlag,
        category: 'urgency',
        timestamp: chunk.timestamp,
        confidence: 0.95,
        severity: 'high',
        quote: chunk.text,
        description: 'Flagged by real-time speech acoustic & script engine',
      });
    }
    if (chunk.riskDelta) {
      call.riskScore = Math.min(100, Math.max(0, (call.riskScore || 0) + chunk.riskDelta));
      call.riskLevel = call.riskScore > 65 ? 'high-risk' : call.riskScore > 30 ? 'suspicious' : 'safe';
    }
    return res.json({ success: true, session: call });
  }
  res.json({ success: true, session: null });
};

app.post('/api/demo/call/transcript', handleTranscript);
app.post('/demo/call/transcript', handleTranscript);

// Classify tactics & risk score (using Gemini LLM if key exists, else heuristic rules)
const handleAnalyze = async (req: express.Request, res: express.Response) => {
  const { transcriptText } = req.body;
  const text = transcriptText || '';

  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are Kaaval's AI Scam Classifier detecting "Digital Arrest" and cyber extortion calls against elderly individuals.
Analyze this call transcript:
"""
${text}
"""
Output ONLY a strict JSON object (no markdown fences) with:
{
  "riskScore": number (0-100),
  "riskLevel": "safe" | "suspicious" | "high-risk",
  "tactics": [
    {
      "id": string,
      "name": "Authority Claim" | "Digital Arrest" | "Urgency" | "Secrecy Demand" | "Financial Verification" | "Video Call Request",
      "category": "authority" | "urgency" | "secrecy" | "digital_arrest" | "financial" | "video_demand",
      "timestamp": "Live",
      "confidence": number (0.0 - 1.0),
      "severity": "low" | "medium" | "high",
      "quote": string,
      "description": string
    }
  ],
  "summary": string
}`,
      });

      const responseText = response.text || '';
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return res.json(parsed);
    } catch (e) {
      console.warn('Gemini inference error, falling back to heuristic engine:', e);
    }
  }

  // Fast Deterministic Heuristics
  const lower = text.toLowerCase();
  const tactics: any[] = [];
  let score = 10;

  if (lower.includes('police') || lower.includes('cbi') || lower.includes('customs') || lower.includes('crime branch') || lower.includes('inspector')) {
    tactics.push({
      id: 't-auth',
      name: 'Authority Claim',
      category: 'authority',
      timestamp: 'Live',
      confidence: 0.96,
      severity: 'medium',
      quote: 'Impersonating Mumbai Police / CBI Cyber Crime Cell',
      description: 'False claims of official law enforcement status.',
    });
    score += 35;
  }

  if (lower.includes('digital arrest') || lower.includes('arrest warrant') || lower.includes('section 420') || lower.includes('video call') || lower.includes('skype')) {
    tactics.push({
      id: 't-arr',
      name: 'Digital Arrest & Video Demand',
      category: 'digital_arrest',
      timestamp: 'Live',
      confidence: 0.99,
      severity: 'high',
      quote: 'Placed under Digital Arrest; mandatory video surveillance',
      description: 'Victim is coerced into video confinement under arrest threats.',
    });
    score += 40;
  }

  if (lower.includes('otp') || lower.includes('transfer') || lower.includes('escrow') || lower.includes('rbi verification') || lower.includes('bank account')) {
    tactics.push({
      id: 't-fin',
      name: 'Financial Secrecy & Transfer Demand',
      category: 'financial',
      timestamp: 'Live',
      confidence: 0.98,
      severity: 'high',
      quote: 'Demand for OTP / escrow money transfer',
      description: 'Extortion for immediate fund transfer under criminal threat.',
    });
    score += 35;
  }

  const riskScore = Math.min(100, score);
  const riskLevel = riskScore > 65 ? 'high-risk' : riskScore > 30 ? 'suspicious' : 'safe';

  res.json({
    riskScore,
    riskLevel,
    tactics,
    summary: tactics.length > 0 ? `Detected ${tactics.length} scam indicators including ${tactics.map((t) => t.name).join(', ')}.` : 'Normal conversational dialogue.',
  });
};

app.post('/api/demo/call/analyze', handleAnalyze);
app.post('/demo/call/analyze', handleAnalyze);

// Trigger Family Alert
const handleAlert = (req: express.Request, res: express.Response) => {
  const alert = req.body;
  activeAlerts.unshift(alert);
  res.json({ success: true, alertCount: activeAlerts.length });
};

app.post('/api/demo/alert', handleAlert);
app.post('/demo/alert', handleAlert);

// List calls
const handleGetCalls = (req: express.Request, res: express.Response) => {
  res.json({ calls: callsStore });
};

app.get('/api/demo/calls', handleGetCalls);
app.get('/demo/calls', handleGetCalls);

// Get single call
const handleGetCallById = (req: express.Request, res: express.Response) => {
  const call = callsStore.find((c) => c.id === req.params.id) || callsStore[0];
  res.json({ call });
};

app.get('/api/demo/calls/:id', handleGetCallById);
app.get('/demo/calls/:id', handleGetCallById);

// Feedback endpoint
const handleFeedback = (req: express.Request, res: express.Response) => {
  const { callId, feedback } = req.body;
  const call = callsStore.find((c) => c.id === callId);
  if (call) {
    call.feedback = feedback;
  }
  res.json({ success: true });
};

app.post('/api/demo/feedback', handleFeedback);
app.post('/demo/feedback', handleFeedback);

// Vite / Static Serving setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kaaval Backend + Vite running on http://localhost:${PORT}`);
  });
}

startServer();
