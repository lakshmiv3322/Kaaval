import { CallSession, FamilyAlert } from '../types';

export type SyncMessage =
  | { type: 'CALL_START'; payload: CallSession; code?: string }
  | { type: 'CALL_UPDATE'; payload: Partial<CallSession>; code?: string }
  | { type: 'TRANSCRIPT_CHUNK'; payload: { callId: string; chunk: any }; code?: string }
  | { type: 'CALL_ANALYSIS'; payload: any; code?: string }
  | { type: 'NEW_ALERT'; payload: FamilyAlert; code?: string }
  | { type: 'FAMILY_BARGE_IN'; payload: { callId: string; familyPhone?: string; message?: string; mode?: string }; code?: string }
  | { type: 'VOICE_WARNING_SENT'; payload: { callId: string; warningText: string }; code?: string }
  | { type: 'FAMILY_HANGUP'; payload: { callId: string }; code?: string }
  | { type: 'RESET_STATE'; payload?: any; code?: string }
  | { type: 'PAIRING_UPDATE'; payload: { code: string }; code?: string };

const PAIRING_CODE_KEY = 'kaaval_pairing_code';

export function getStoredPairingCode(): string {
  if (typeof window === 'undefined') return '492810';
  const stored = localStorage.getItem(PAIRING_CODE_KEY);
  if (stored && stored.length === 6) return stored;
  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
  localStorage.setItem(PAIRING_CODE_KEY, newCode);
  return newCode;
}

export function setStoredPairingCode(code: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PAIRING_CODE_KEY, code);
}

class SyncBus {
  private channel: BroadcastChannel | null = null;
  private sse: EventSource | null = null;
  private listeners: ((msg: SyncMessage) => void)[] = [];
  private pairingCode: string = '492810';

  constructor() {
    if (typeof window !== 'undefined') {
      this.pairingCode = getStoredPairingCode();

      // 1. BroadcastChannel for fast local cross-tab sync
      if ('BroadcastChannel' in window) {
        try {
          this.channel = new BroadcastChannel('kaaval_channel');
          this.channel.onmessage = (event) => {
            this.notify(event.data);
          };
        } catch (e) {
          console.warn('BroadcastChannel not available', e);
        }
      }

      // 2. Storage fallback
      window.addEventListener('storage', (e) => {
        if (e.key === 'kaaval_sync_msg' && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            this.notify(data);
          } catch (err) {
            console.error(err);
          }
        }
      });

      // 3. Connect SSE for real cross-device synchronization
      this.connectSSE(this.pairingCode);
    }
  }

  public setPairingCode(code: string) {
    this.pairingCode = code;
    setStoredPairingCode(code);
    this.connectSSE(code);
    this.publish({ type: 'PAIRING_UPDATE', payload: { code }, code });
  }

  public getPairingCode(): string {
    return this.pairingCode;
  }

  private connectSSE(code: string) {
    if (typeof window === 'undefined') return;
    if (this.sse) {
      this.sse.close();
      this.sse = null;
    }

    try {
      this.sse = new EventSource(`/api/events?code=${encodeURIComponent(code)}`);
      this.sse.onmessage = (event) => {
        if (!event.data || event.data === ': keepalive') return;
        try {
          const msg = JSON.parse(event.data);
          if (msg && msg.type && msg.type !== 'CONNECTED') {
            this.notify(msg);
          }
        } catch (_err) {
          // heartbeat or non-json message
        }
      };
      this.sse.onerror = () => {
        // SSE auto-reconnects natively
      };
    } catch (e) {
      console.warn('SSE connection failed', e);
    }
  }

  public publish(msg: SyncMessage) {
    const enrichedMsg: SyncMessage = {
      ...msg,
      code: msg.code || this.pairingCode,
    };

    // 1. BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(enrichedMsg);
      } catch (_e) {}
    }

    // 2. LocalStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('kaaval_sync_msg', JSON.stringify({ ...enrichedMsg, _t: Date.now() }));
      } catch (_e) {}
    }

    // 3. Server SSE publish (relays to all remote devices connected with this code)
    if (typeof window !== 'undefined') {
      fetch('/api/events/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enrichedMsg),
      }).catch(() => {
        // offline or silent
      });
    }

    // 4. Local subscribers
    this.notify(enrichedMsg);
  }

  public subscribe(callback: (msg: SyncMessage) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify(msg: SyncMessage) {
    this.listeners.forEach((listener) => {
      try {
        listener(msg);
      } catch (e) {
        console.error('Error in sync listener:', e);
      }
    });
  }
}

export const syncBus = new SyncBus();
