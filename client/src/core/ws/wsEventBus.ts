import type { MessageType, WsEventCallback } from "./type";

class WsEventBus {
  private eventBus: Map<MessageType, WsEventCallback[]>;

  constructor() {
    this.eventBus = new Map();
  }

  public on(event: MessageType, callback: WsEventCallback) {
    const callbacks = this.eventBus.get(event) || [];
    callbacks.push(callback);
    this.eventBus.set(event, callbacks);
  }

  public off(event: MessageType, callback: WsEventCallback) {
    const callbacks = this.eventBus.get(event) || [];
    callbacks.splice(callbacks.indexOf(callback), 1);
    this.eventBus.set(event, callbacks);
  }

  public emit(event: MessageType, data: any) {
    const callbacks = this.eventBus.get(event) || [];
    callbacks.forEach((callback) => callback(data));
  }
}

const wsEventBus = new WsEventBus();

export default wsEventBus;
