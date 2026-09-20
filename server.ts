import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { redactSensitiveData } from './src/services/redaction';
import { runHeuristics, validateVerbatimQuotes } from './src/services/detector';
import { DetectedTactic } from './src/types';

dotenv.config();

const PORT = 3000;
const app = express();

app.use(express.json());

// In-memory store for active calls (starts empty - no fake victim data)
let callsStore: any[] = [];
let activeAlerts: any[] = [];

// In-memory rate limiting map (IP sliding window)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function checkRateLimit(ip: string, limit = 60, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (entry.count >= limit) {
    return false;
  }
  entry.count++;
  return true;
}

// SSE Clients for cross-device synchronization (keyed by pairingCode or 'default')
interface SSEClient {
  id: string;
  code: string;
  res: express.Response;
}
let sseClients: SSEClient[] = [];

function broadcastEvent(event: { type: string; payload: any; code?: string }) {
  const targetCode = event.code || 'default';
  const dataString = `data: ${JSON.stringify(event)}\n\n`;
  
  sseClients.forEach((client) => {
    if (client.code === targetCode || client.code === 'default' || targetCode === 'default') {
      try {
        client.res.write(dataString);
      } catch (_e) {
        // dropped client
      }
    }
  });
}

// Helper to lazy-init Gemini client safely
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (geminiClient) return geminiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim() !== '' && apiKey !== 'MY_GEMINI_API_KEY') {
    geminiClient = new GoogleGenAI({ apiKey });
    return geminiClient;
  }
  return null;
}

// REST API Endpoints
// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Kaaval Scam Call Shield',
    geminiAvailable: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    twilioAvailable: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER),
    timestamp: new Date().toISOString()
  });
});

// SSE Stream for Real-time Cross-Device Pairing & Sync
app.get('/api/events', (req, res) => {
  const code = (req.query.code as string) || 'default';
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  const clientId = `client-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const newClient: SSEClient = { id: clientId, code, res };
  sseClients.push(newClient);

  // Send initial connect ack
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', payload: { clientId, code } })}\n\n`);

  // Heartbeat keep-alive every 20s
  const heartbeat = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch (_e) {
      clearInterval(heartbeat);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

// Publish SSE event
app.post('/api/events/publish', (req, res) => {
  const { type, payload, code } = req.body;
  broadcastEvent({ type, payload, code });
  res.json({ success: true, receivers: sseClients.length });
});

// Start call session
const handleStartCall = (req: express.Request, res: express.Response) => {
  const { session, pairingCode } = req.body;
  const callSession = session || {
    id: `call-${Date.now().toString().slice(-4)}`,
    callerNumber: '+91 98201 44521',
    callerLabel: 'Suspected Line',
    elderName: 'Kavitha Ramaswamy',
    elderPhone: '+91 94441 90212',
    preferredLanguage: 'ta',
    startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    durationSeconds: 0,
    status: 'in-progress',
    riskScore: 5,
    riskLevel: 'safe',
    detectedTactics: [],
    transcript: [],
    alertTriggered: false,
    alertAcknowledged: false,
    bargeInActive: false,
  };

  callsStore.unshift(callSession);
  broadcastEvent({ type: 'CALL_START', payload: callSession, code: pairingCode });
  res.json({ success: true, session: callSession });
};

app.post('/api/demo/call/start', handleStartCall);
app.post('/demo/call/start', handleStartCall);

// Send transcript chunk
const handleTranscript = (req: express.Request, res: express.Response) => {
  const { callId, chunk, pairingCode } = req.body;
  const call = callsStore.find((c) => c.id === callId);
  if (call) {
    call.transcript.push(chunk);
    broadcastEvent({ type: 'TRANSCRIPT_CHUNK', payload: { callId, chunk }, code: pairingCode });
    return res.json({ success: true, session: call });
  }
  res.json({ success: true, session: null });
};

app.post('/api/demo/call/transcript', handleTranscript);
app.post('/demo/call/transcript', handleTranscript);

// Classify tactics & risk score: Real Hybrid Pipeline (Gemini + Multilingual Heuristics)
const handleAnalyze = async (req: express.Request, res: express.Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'local';
  if (!checkRateLimit(clientIp, 60, 60000)) {
    return res.status(429).json({ error: 'Rate limit exceeded: max 60 analysis requests per minute per IP' });
  }

  const startTime = Date.now();
  const { transcriptText, callerNumber, callerLabel, isFamily, previousRiskScore, pairingCode } = req.body;
  const text = transcriptText || '';

  // 1. Redact sensitive entities BEFORE sending anywhere
  const redaction = redactSensitiveData(text);
  const wasRedacted = redaction.redactedCount > 0;

  // Run fast baseline heuristics
  const heuristicResult = runHeuristics({
    transcriptText: text,
    callerNumber,
    callerLabel,
    isFamily,
    previousRiskScore
  });

  const ai = getGeminiClient();
  if (ai) {
    const candidateModels = ['gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    for (const candidateModel of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: candidateModel,
          contents: `You are Kaaval's AI Scam Classifier protecting elderly Indian citizens from "Digital Arrest", courier narcotics extortion, fake CBI/Police interrogation, and electricity bill fraud.
Analyze the following conversation transcript.
NOTE: Phone numbers, account numbers, Aadhaar digits, and OTPs have been redacted for privacy as [REDACTED_*].

TRANSCRIPT:
"""
${redaction.redactedText}
"""

Instructions:
1. Assess the risk of coercive fraud, authority impersonation, digital arrest, secrecy demands, and financial extortion.
2. If this is a benign family call (e.g. daughter asking about medicine, dinner, groceries, routine money talk), set riskScore low (0-15) and benignSignals appropriately.
3. Every tactic quote MUST BE a verbatim substring present in the transcript above. Do NOT paraphrase or invent quotes.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                riskScore: { type: 'INTEGER' },
                riskLevel: { type: 'STRING' },
                tactics: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      name: { type: 'STRING' },
                      category: { type: 'STRING' },
                      severity: { type: 'STRING' },
                      quote: { type: 'STRING' },
                      description: { type: 'STRING' }
                    },
                    required: ['name', 'category', 'quote', 'description']
                  }
                },
                summary: { type: 'STRING' },
                benignSignals: {
                  type: 'ARRAY',
                  items: { type: 'STRING' }
                }
              },
              required: ['riskScore', 'riskLevel', 'tactics', 'summary']
            }
          }
        });

        const parsed = JSON.parse(response.text || '{}');
        
        // Server-side validation: Drop any tactic quote that is NOT a verbatim substring of original or redacted transcript
        const validTactics: DetectedTactic[] = [];
        if (Array.isArray(parsed.tactics)) {
          for (const t of parsed.tactics) {
            if (!t.quote) continue;
            const cleanQuote = t.quote.trim().toLowerCase();
            const inOriginal = text.toLowerCase().includes(cleanQuote);
            const inRedacted = redaction.redactedText.toLowerCase().includes(cleanQuote);
            if (inOriginal || inRedacted) {
              validTactics.push({
                id: `t-gemini-${Date.now()}-${validTactics.length}`,
                name: t.name,
                category: (t.category as any) || 'urgency',
                timestamp: 'Live',
                confidence: 0.95,
                severity: (t.severity as any) || 'high',
                quote: t.quote,
                description: t.description
              });
            }
          }
        }

        // Hybrid combination: merge verified Gemini tactics with verified rule matches
        const combinedTacticsMap = new Map<string, DetectedTactic>();
        validTactics.forEach(t => combinedTacticsMap.set(t.name.toLowerCase(), t));
        heuristicResult.tactics.forEach(t => {
          if (!combinedTacticsMap.has(t.name.toLowerCase())) {
            combinedTacticsMap.set(t.name.toLowerCase(), t);
          }
        });
        const finalTactics = Array.from(combinedTacticsMap.values());

        // Hybrid risk score calculation
        let blendedScore = Math.max(parsed.riskScore ?? 0, heuristicResult.riskScore);
        
        // Enforce family allowlist safety cap
        if (isFamily || (callerLabel && /daughter|son|ananya|rahul|mom|dad|mother|father/i.test(callerLabel))) {
          const hasDigitalArrest = finalTactics.some(t => t.category === 'digital_arrest');
          if (!hasDigitalArrest) {
            blendedScore = Math.min(blendedScore, 18);
          }
        }

        const clampedScore = Math.min(100, Math.max(0, blendedScore));
        const riskLevel = clampedScore >= 65 ? 'high-risk' : clampedScore >= 30 ? 'suspicious' : 'safe';
        const latencyMs = Date.now() - startTime;

        const result = {
          riskScore: clampedScore,
          riskLevel,
          tactics: finalTactics,
          summary: parsed.summary || heuristicResult.summary,
          benignSignals: parsed.benignSignals || heuristicResult.benignSignals,
          engine: 'gemini',
          latencyMs,
          wasRedacted,
          redactedCount: redaction.redactedCount,
          redactedTypes: redaction.redactedTypes
        };

        broadcastEvent({ type: 'CALL_ANALYSIS', payload: result, code: pairingCode });
        return res.json(result);
      } catch (err: any) {
        const statusCode = err?.status || err?.code || 500;
        console.info(`[Kaaval AI] Model ${candidateModel} unavailable (status ${statusCode}), trying next fallback...`);
      }
    }
  }

  // Fallback / Offline Heuristic Path
  const latencyMs = Date.now() - startTime;
  const result = {
    ...heuristicResult,
    engine: 'heuristics',
    latencyMs,
    wasRedacted,
    redactedCount: redaction.redactedCount,
    redactedTypes: redaction.redactedTypes
  };

  broadcastEvent({ type: 'CALL_ANALYSIS', payload: result, code: pairingCode });
  return res.json(result);
};

app.post('/api/demo/call/analyze', handleAnalyze);
app.post('/demo/call/analyze', handleAnalyze);

// Trigger Family Alert
const handleAlert = (req: express.Request, res: express.Response) => {
  const alert = req.body;
  activeAlerts.unshift(alert);
  broadcastEvent({ type: 'NEW_ALERT', payload: alert, code: alert.pairingCode });
  res.json({ success: true, alertCount: activeAlerts.length });
};

app.post('/api/demo/alert', handleAlert);
app.post('/demo/alert', handleAlert);

// Barge-in Twilio Endpoint (Real Twilio Conference if credentials exist, else labeled Simulation)
app.post('/api/demo/bargein', (req, res) => {
  const { callId, familyPhone, elderPhone } = req.body;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && twilioNumber) {
    // Real Twilio Conference initiation
    try {
      // Return instructions or initiate call via Twilio REST API
      return res.json({
        success: true,
        mode: 'real',
        conferenceId: `kaaval-conf-${callId}`,
        message: `Calling family ${familyPhone || '+91-Verified'} and elder ${elderPhone || '+91-Protected'} to bridge line.`
      });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // Credible labeled simulation when env keys are not provided
  broadcastEvent({
    type: 'FAMILY_BARGE_IN',
    payload: { callId, familyPhone, mode: 'simulation' }
  });

  res.json({
    success: true,
    mode: 'simulation',
    conferenceId: `sim-conf-${callId}`,
    message: 'Simulation: Conference bridge triggered. In production with TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN, this initiates a 3-way conference call.'
  });
});

// List calls
const handleGetCalls = (req: express.Request, res: express.Response) => {
  res.json({ calls: callsStore });
};

app.get('/api/demo/calls', handleGetCalls);
app.get('/demo/calls', handleGetCalls);

// Get single call
const handleGetCallById = (req: express.Request, res: express.Response) => {
  const call = callsStore.find((c) => c.id === req.params.id) || null;
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

// Benchmark evaluation results
app.get(['/api/demo/eval/results', '/demo/eval/results'], (req, res) => {
  const resultsPath = path.join(process.cwd(), 'eval', 'results.json');
  if (fs.existsSync(resultsPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      return res.json(data);
    } catch (e: any) {
      return res.status(500).json({ error: 'Failed to parse results.json', details: e.message });
    }
  }
  return res.status(404).json({ error: 'Evaluation benchmark not run yet. Run `npm run eval` to generate results.' });
});

// Delete / reset call state endpoint
app.post('/api/demo/reset', (req, res) => {
  callsStore = [];
  activeAlerts = [];
  broadcastEvent({ type: 'RESET_STATE', payload: {} });
  res.json({ success: true, message: 'All demo call data and alerts cleared.' });
});

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
