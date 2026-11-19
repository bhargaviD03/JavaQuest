export type GameEventType =
  | 'SCENE_READY'
  | 'CODE_EXECUTED'
  | 'LEVEL_LOADED'
  | 'OBJECT_CLICKED'
  | 'CREATURE_ACTION'
  | 'CHALLENGE_COMPLETED'
  | 'LEVEL_FAILED'
  | 'REQUEST_HINT'
  | 'RESET_SCENE';

export interface GameBridgePayload {
  gameId: string;
  eventType: GameEventType;
  data?: any;
}

type EventListener = (payload: GameBridgePayload) => void;

export class GameBridge {
  private listeners: Map<GameEventType, Set<EventListener>> = new Map();

  public on(eventType: GameEventType, callback: EventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  public off(eventType: GameEventType) {
    this.listeners.delete(eventType);
  }

  public emit(eventType: GameEventType, payload: Omit<GameBridgePayload, 'eventType'>) {
    const fullPayload: GameBridgePayload = {
      ...payload,
      eventType,
    };
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(fullPayload);
        } catch (err) {
          console.error(`[GameBridge] Error executing listener for ${eventType}:`, err);
        }
      });
    }
  }

  public clearAll() {
    this.listeners.clear();
  }
}

export const gameBridge = new GameBridge();

