import { MessageType } from "../schema";
import { EventHandler, wsEventBus } from "../wsEventBus";

const connectHandler: EventHandler = (payload, socket, userId) => {
  socket.send(JSON.stringify({
    type: "connection",
    data: {
      success: true,
      connectId: payload.connectId,
      userId,
      timestamp: Date.now()
    }
  }))
}


wsEventBus.on(MessageType.connection, connectHandler);