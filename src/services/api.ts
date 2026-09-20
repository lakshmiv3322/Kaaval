import { CallSession, DetectedTactic, FamilyAlert, TranscriptChunk } from '../types';
import { INITIAL_RECENT_CALLS, SCENARIO_PRESETS } from './scamScenarios';

const STORAGE_CALLS_KEY = 'kaaval_calls_history';
const STORAGE_CURRENT_CALL_KEY = 'kaaval_current_call';

export const getStoredCalls = (): CallSession[] => {
  if (typeof window === 'undefined') return INITIAL_RECENT_CALLS;
  try {
    const raw = localStorage.getItem(STORAGE_CALLS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_CALLS_KEY, JSON.stringify(INITIAL_RECENT_CALLS));
      return INITIAL_RECENT_CALLS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_RECENT_CALLS;
  }
};

export const saveStoredCalls = (calls: CallSession[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_CALLS_KEY, JSON.stringify(calls));
  } catch (e) {
    console.error(e);
  }
};

export const getCurrentActiveCall = (): CallSession | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_CALL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const saveCurrentActiveCall = (call: CallSession | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (call) {
      localStorage.setItem(STORAGE_CURRENT_CALL_KEY, JSON.stringify(call));
    } else {
      localStorage.removeItem(STORAGE_CURRENT_CALL_KEY);
    }
  } catch (e) {
    console.error(e);
  }
};

// REST API calls matching the requested specification:
// POST /demo/call/start
// POST /demo/call/transcript
// POST /demo/call/analyze
// POST /demo/alert
// GET /demo/calls
// GET /demo/calls/:id
// POST /demo/feedback

export const api = {
  async startCall(scenarioId: string): Promise<CallSession> {
    const scenario = SCENARIO_PRESETS.find((s) => s.id === scenarioId) || SCENARIO_PRESETS[0];
    const newCall: CallSession = {
      id: `call-${Date.now().toString().slice(-4)}`,
      callerNumber: scenario.callerNumber,
      callerLabel: scenario.callerName,
      elderName: 'Kavitha Ramaswamy (Mother)',
      elderPhone: '+91 94441 90212',
      preferredLanguage: scenario.language,
      startTime: 'Just now',
      durationSeconds: 0,
      status: 'in-progress',
      riskScore: 10,
      riskLevel: 'safe',
      detectedTactics: [],
      transcript: [],
      alertTriggered: false,
      alertAcknowledged: false,
      bargeInActive: false,
      scamType: scenario.scamType,
    };

    try {
      const res = await fetch('/api/demo/call/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId, session: newCall }),
      });
      if (res.ok) {
        const data = await res.json();
        saveCurrentActiveCall(data.session);
        return data.session;
      }
    } catch (e) {
      // Offline fallback
    }

    saveCurrentActiveCall(newCall);
    return newCall;
  },

  async appendTranscript(callId: string, chunk: TranscriptChunk): Promise<CallSession | null> {
    try {
      const res = await fetch('/api/demo/call/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId, chunk }),
      });
      if (res.ok) {
        const data = await res.json();
        saveCurrentActiveCall(data.session);
        return data.session;
      }
    } catch (e) {
      // Fallback
    }

    const current = getCurrentActiveCall();
    if (current && current.id === callId) {
      const updated: CallSession = {
        ...current,
        transcript: [...current.transcript, chunk],
      };
      saveCurrentActiveCall(updated);
      return updated;
    }
    return null;
  },

  async analyzeCall(callId: string, transcriptText: string): Promise<{ tactics: DetectedTactic[]; riskScore: number; riskLevel: string }> {
    try {
      const res = await fetch('/api/demo/call/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId, transcriptText }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Fallback
    }

    // Heuristic analysis if offline
    const lower = transcriptText.toLowerCase();
    const tactics: DetectedTactic[] = [];
    let risk = 12;

    if (lower.includes('police') || lower.includes('cbi') || lower.includes('customs') || lower.includes('inspector')) {
      tactics.push({
        id: 't-auth',
        name: 'Authority Claim',
        category: 'authority',
        timestamp: 'Live',
        confidence: 0.95,
        severity: 'medium',
        quote: 'Law enforcement / investigation authority claim',
        description: 'Impersonating law enforcement officer',
      });
      risk += 35;
    }

    if (lower.includes('arrest') || lower.includes('warrant') || lower.includes('video call') || lower.includes('skype')) {
      tactics.push({
        id: 't-arr',
        name: 'Digital Arrest Threat',
        category: 'digital_arrest',
        timestamp: 'Live',
        confidence: 0.98,
        severity: 'high',
        quote: 'Coerced video surveillance and arrest threat',
        description: 'Coercing the elder to stay on video line',
      });
      risk += 40;
    }

    if (lower.includes('otp') || lower.includes('transfer') || lower.includes('escrow') || lower.includes('bank') || lower.includes('secret')) {
      tactics.push({
        id: 't-sec',
        name: 'Financial Secrecy / OTP Demand',
        category: 'secrecy',
        timestamp: 'Live',
        confidence: 0.99,
        severity: 'high',
        quote: 'Demand for OTP / financial credentials',
        description: 'Direct pressure for money transfer or credentials',
      });
      risk += 35;
    }

    const clampedRisk = Math.min(100, risk);
    return {
      tactics,
      riskScore: clampedRisk,
      riskLevel: clampedRisk > 65 ? 'high-risk' : clampedRisk > 30 ? 'suspicious' : 'safe',
    };
  },

  async triggerFamilyAlert(alert: FamilyAlert): Promise<boolean> {
    try {
      await fetch('/api/demo/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert),
      });
    } catch (e) {
      // ok
    }
    return true;
  },

  async getCalls(): Promise<CallSession[]> {
    try {
      const res = await fetch('/api/demo/calls');
      if (res.ok) {
        const data = await res.json();
        return data.calls;
      }
    } catch (e) {
      // offline fallback
    }
    return getStoredCalls();
  },

  async getCallById(callId: string): Promise<CallSession | null> {
    try {
      const res = await fetch(`/api/demo/calls/${callId}`);
      if (res.ok) {
        const data = await res.json();
        return data.call;
      }
    } catch (e) {
      // fallback
    }
    const calls = getStoredCalls();
    const active = getCurrentActiveCall();
    if (active && active.id === callId) return active;
    return calls.find((c) => c.id === callId) || calls[0] || null;
  },

  async sendFeedback(callId: string, feedback: 'scam' | 'safe' | 'unsure'): Promise<boolean> {
    try {
      await fetch('/api/demo/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId, feedback }),
      });
    } catch (e) {
      // fallback
    }
    const calls = getStoredCalls();
    const updated = calls.map((c) => (c.id === callId ? { ...c, feedback } : c));
    saveStoredCalls(updated);
    return true;
  },
};
