export type SyncEventPayload = {
  type: string;
  [key: string]: any;
};

type SyncListener = (payload: SyncEventPayload) => void;

const listeners: Set<SyncListener> = new Set();

let channel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  channel = new BroadcastChannel('ipms_sync_channel');
  channel.onmessage = (event) => {
    listeners.forEach((listener) => {
      try {
        listener(event.data);
      } catch (e) {
        console.error('Error in sync listener:', e);
      }
    });
  };
}

export function broadcastSyncEvent(payload: SyncEventPayload) {
  if (typeof window !== 'undefined') {
    if (channel) {
      try {
        channel.postMessage(payload);
      } catch (e) {
        console.error('Broadcast error:', e);
      }
    }
    listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (e) {
        console.error('Error in sync listener:', e);
      }
    });
  }
}

export function subscribeSyncEvent(listener: SyncListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
