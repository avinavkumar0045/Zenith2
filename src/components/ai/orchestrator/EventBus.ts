type EventCallback = (payload?: any) => void;

class EventBusClass {
  private listeners: Record<string, EventCallback[]> = {};

  /**
   * Subscribe to an event.
   */
  public on(event: string, callback: EventCallback): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  /**
   * Unsubscribe from an event.
   */
  public off(event: string, callback: EventCallback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  /**
   * Publish an event to all subscribers.
   */
  public emit(event: string, payload?: any) {
    if (!this.listeners[event]) return;
    
    // Defer execution slightly to avoid blocking UI cycles
    setTimeout(() => {
      this.listeners[event].forEach(callback => {
        try {
          callback(payload);
        } catch (err) {
          console.error(`Error in event listener for ${event}:`, err);
        }
      });
    }, 0);
  }
}

export const EventBus = new EventBusClass();
export default EventBus;
