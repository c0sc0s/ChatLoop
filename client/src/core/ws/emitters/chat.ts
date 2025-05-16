import wsClient from "../client";
import { ChatMessageType, type IWsMessage } from "../type";

class ChatWsEmitter {
  private get sendMessage() {
    return (msgInfo: IWsMessage) => {
      wsClient.sendMessage(msgInfo);
    };
  }

  public chatToUser(userId: string, content: string) {
    this.sendMessage({
      type: ChatMessageType.send,
      data: {
        conversationId: userId,
        content,
      },
    });
  }
}

const chatWsEmitter = new ChatWsEmitter();

export default chatWsEmitter;
