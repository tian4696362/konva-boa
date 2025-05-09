type EventCallback = (data?: any) => void;

class EventBus {
  private events: { [eventName: string]: EventCallback[] } = {};

  on(eventName: string, callback: EventCallback): void {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  emit(eventName: string, data?: any): void {
    if (this.events[eventName]) {
      this.events[eventName].forEach((callback) => callback(data));
    }
  }

  off(eventName: string, callback: EventCallback): void {
    if (this.events[eventName]) {
      const index = this.events[eventName].indexOf(callback);
      if (index!== -1) {
        this.events[eventName].splice(index, 1);
      }
    }
  }
}

const eventBus = new EventBus();
export default eventBus;    