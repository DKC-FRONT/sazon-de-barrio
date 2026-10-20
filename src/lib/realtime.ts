// Sistema de sincronización multiusuario en tiempo real entre pestañas
// Soporta BroadcastChannel con fallback automático a StorageEvent

export type RealtimeEvent =
  | { type: "REQUEST_CREATED"; payload: { requestId: string; tableName: string; reason: string; note: string } }
  | { type: "REQUEST_ATTENDED"; payload: { requestId: string } }
  | { type: "TABLE_UPDATED"; payload: { tableId: number } }
  | { type: "ORDER_PAID"; payload: { tableId: number; invoiceId: string; total: number } }
  | { type: "DATA_MUTATED"; payload: { timestamp: number } };

type Listener = (event: RealtimeEvent) => void;

class RealtimeHub {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<Listener> = new Set();
  private isClient = typeof window !== "undefined";

  constructor() {
    if (this.isClient) {
      try {
        if ("BroadcastChannel" in window) {
          this.channel = new BroadcastChannel("sazon_barrio_rt_v1");
          this.channel.onmessage = (msg: MessageEvent) => {
            this.notifyListeners(msg.data);
          };
        }
      } catch {
        // Fallback to storage event
      }

      window.addEventListener("storage", (e) => {
        if (e.key === "sazon_rt_event" && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            this.notifyListeners(parsed);
          } catch {
            // ignore
          }
        }
      });
    }
  }

  private notifyListeners(event: RealtimeEvent) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in realtime listener:", err);
      }
    });
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public publish(event: RealtimeEvent): void {
    if (!this.isClient) return;

    // Notificar a otras pestañas por BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(event);
      } catch {
        // ignore
      }
    }

    // Fallback con localStorage para garantizar compatibilidad total
    try {
      localStorage.setItem("sazon_rt_event", JSON.stringify({ ...event, _t: Date.now() }));
    } catch {
      // ignore
    }
  }
}

export const realtimeHub = new RealtimeHub();
