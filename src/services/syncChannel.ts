import { CallSession, FamilyAlert } from '../types';

type SyncMessage =
  | { type: 'CALL_UPDATE'; payload: Partial<CallSession> }
  | { type: 'NEW_ALERT'; payload: FamilyAlert }
  | { type: 'FAMILY_BARGE_IN'; payload: { callId: string; message: string } }
  | { type: 'VOICE_WARNING_SENT'; payload: { callId: string; warningText: string } }
  | { type: 'FAMILY_HANGUP'; payload: { callId: string } }
  | { type: 'RESET_STATE' };

class SyncBus {
  private channel: BroadcastChannel | null = null;
  private listeners: ((msg: SyncMessage) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('kaaval_channel');
        this.channel.onmessage = (event) => {
          this.notify(event.data);
        };
      } catch (e) {
        console.warn('BroadcastChannel not available, using window events fallback', e);
      }
    }

    // Register storage fallback ONLY when BroadcastChannel is unavailable
    if (typeof window !== 'undefined' && !this.channel) {
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
    }
  }

  public publish(msg: SyncMessage) {
    if (this.channel) {
      this.channel.postMessage(msg);
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('kaaval_sync_msg', JSON.stringify({ ...msg, _t: Date.now() }));
      } catch (e) {
        // ignore quota issues
      }
    }
    this.notify(msg);
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
