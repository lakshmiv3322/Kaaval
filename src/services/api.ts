import { CallSession, DetectedTactic, FamilyAlert, TranscriptChunk, AnalysisResult } from '../types';
import { INITIAL_RECENT_CALLS, SCENARIO_PRESETS } from './scamScenarios';
import { runHeuristics } from './detector';
import { redactSensitiveData } from './redaction';
import { syncBus } from './syncChannel';

const STORAGE_CALLS_KEY = 'kaaval_calls_history';
const STORAGE_CURRENT_CALL_KEY = 'kaaval_current_call';

export const getStoredCalls = (): CallSession[] => {
  if (typeof window === 'undefined') return INITIAL_RECENT_CALLS;
  try {
    const raw = localStorage.getItem(STORAGE_CALLS_KEY);
    if (!raw) {
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
      scamType: scenario.scamType,
    };

    try {
      const res = await fetch('/api/demo/call/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId,
          session: newCall,
          pairingCode: syncBus.getPairingCode()
        }),
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
        body: JSON.stringify({
          callId,
          chunk,
          pairingCode: syncBus.getPairingCode()
        }),
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

  async analyzeCall(params: {
    callId?: string;
    transcriptText: string;
    callerNumber?: string;
    callerLabel?: string;
    isFamily?: boolean;
    previousRiskScore?: number;
  }): Promise<AnalysisResult> {
    const startTime = Date.now();
    try {
      const res = await fetch('/api/demo/call/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          pairingCode: syncBus.getPairingCode()
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {
      // Offline fallback to client heuristics
    }

    // Client-side offline heuristic fallback
    const heuristic = runHeuristics({
      transcriptText: params.transcriptText,
      callerNumber: params.callerNumber,
      callerLabel: params.callerLabel,
      isFamily: params.isFamily,
      previousRiskScore: params.previousRiskScore
    });

    const redaction = redactSensitiveData(params.transcriptText);

    return {
      ...heuristic,
      latencyMs: Date.now() - startTime,
      engine: 'heuristics',
      wasRedacted: redaction.redactedCount > 0,
    };
  },

  async triggerFamilyAlert(alert: FamilyAlert): Promise<boolean> {
    try {
      await fetch('/api/demo/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...alert,
          pairingCode: syncBus.getPairingCode()
        }),
      });
    } catch (e) {
      // ok
    }
    return true;
  },

  async triggerBargeIn(params: { callId: string; familyPhone?: string; elderPhone?: string }): Promise<any> {
    try {
      const res = await fetch('/api/demo/bargein', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // offline simulation
    }
    return {
      success: true,
      mode: 'simulation',
      message: 'Simulation: Triggered 3-way conference bridge'
    };
  },

  async getCalls(): Promise<CallSession[]> {
    try {
      const res = await fetch('/api/demo/calls');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.calls) && data.calls.length > 0) {
          return data.calls;
        }
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
        if (data.call) return data.call;
      }
    } catch (e) {
      // fallback
    }
    const calls = getStoredCalls();
    const active = getCurrentActiveCall();
    if (active && active.id === callId) return active;
    return calls.find((c) => c.id === callId) || null;
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

  async resetAll(): Promise<void> {
    try {
      await fetch('/api/demo/reset', { method: 'POST' });
    } catch (_e) {}
    saveStoredCalls([]);
    saveCurrentActiveCall(null);
  },

  async getSystemStatus(): Promise<{
    geminiAvailable: boolean;
    twilioAvailable: boolean;
    mode: 'live-hybrid' | 'simulation';
  }> {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        return {
          geminiAvailable: Boolean(data.geminiAvailable),
          twilioAvailable: Boolean(data.twilioAvailable),
          mode: data.geminiAvailable ? 'live-hybrid' : 'simulation',
        };
      }
    } catch (_e) {}
    return {
      geminiAvailable: false,
      twilioAvailable: false,
      mode: 'simulation',
    };
  }
};
