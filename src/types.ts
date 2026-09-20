export type RiskLevel = 'safe' | 'suspicious' | 'high-risk';

export interface DetectedTactic {
  id: string;
  name: string;
  category: 'authority' | 'urgency' | 'secrecy' | 'digital_arrest' | 'financial' | 'video_demand' | 'isolation';
  timestamp: string; // e.g., "00:18"
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  quote: string;
  description: string;
}

export interface TranscriptChunk {
  id: string;
  timestamp: string;
  speaker: 'caller' | 'elder' | 'agent';
  text: string;
  translation?: string;
  tacticFlag?: string;
  riskDelta?: number;
}

export interface CallSession {
  id: string;
  callerNumber: string;
  callerLabel: string;
  elderName: string;
  elderPhone: string;
  preferredLanguage: string;
  startTime: string;
  durationSeconds: number;
  status: 'idle' | 'in-progress' | 'barged-in' | 'ended';
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  detectedTactics: DetectedTactic[];
  transcript: TranscriptChunk[];
  alertTriggered: boolean;
  alertAcknowledged: boolean;
  bargeInActive: boolean;
  scamType?: string;
  feedback?: 'scam' | 'safe' | 'unsure';
}

export interface FamilyAlert {
  id: string;
  callId: string;
  elderName: string;
  timestamp: string;
  riskScore: number;
  tactics: string[];
  summary: string;
  status: 'active' | 'dismissed' | 'barged-in';
}

export interface ScenarioScript {
  id: string;
  title: string;
  scamType: string;
  callerName: string;
  callerNumber: string;
  language: string;
  chunks: {
    delayMs: number;
    speaker: 'caller' | 'elder' | 'agent';
    text: string;
    translation?: string;
    tactic?: DetectedTactic;
    riskScore: number;
  }[];
}
