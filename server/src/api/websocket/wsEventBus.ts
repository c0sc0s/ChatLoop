import { MessageType } from "./schema";

export type EventHandler = (payload: any, socket: WebSocket, userId: string) => void;

// 创建事件总线
class WebSocketEventBus {
  private handlers: Map<MessageType, Array<EventHandler>> = new Map();

  // 注册事件处理器
  on(eventType: MessageType, handler: EventHandler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  // 触发事件
  emit(eventType: MessageType, payload: any, socket: WebSocket, userId: string) {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(payload, socket, userId);
        } catch (error) {
          console.error(`处理WebSocket事件 ${eventType} 时出错:`, error);
        }
      }
      return true;
    }
    return false;
  }
}

// 创建全局事件总线实例
export const wsEventBus = new WebSocketEventBus();