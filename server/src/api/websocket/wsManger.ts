import { FastifyInstance } from "fastify";
import generateConnectionId from "./utils";
import WebSocketPlugin, { type WebSocket } from "@fastify/websocket";
import { getUserInfoFromToken } from "../plugins/auth";
import { MessageSchema, MessageType } from "./schema";
import { wsEventBus } from "./wsEventBus";

export const WS_URL = "/ws/connect";
const PING_INTERVAL = 30000;

class WebSocketManager {
  private static instance: WebSocketManager;
  private constructor() { }
  private _connections: Map<string, Set<WebSocket>> = new Map();
  private _userConnectionIds: Map<string, Map<string, WebSocket>> = new Map();
  private _hasInit: boolean = false;

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  public init(app: FastifyInstance) {
    if (this._hasInit) return;
    this._hasInit = true;
    const wsManager = this;

    app.register(WebSocketPlugin);
    app.register(function (fastify) {
      fastify.get(WS_URL, { websocket: true }, (socket, req) => {
        const query = req.query as { token: string };
        const token = query.token;
        let userId: string = '';

        try {
          const userInfo = getUserInfoFromToken(token);
          userId = userInfo.userId.toString();

          if (!userId) {
            throw new Error("无效的用户ID");
          }

          wsManager._handleUserConnection(socket, userId);
        } catch (error) {
          console.error("WebSocket连接认证失败:", error);
          wsManager._sendError(socket, userId, "无效的令牌或用户ID");
          socket.close();
          return;
        }

        socket.on("message", (message: string) => {
          wsManager._handleMessage(socket, message, userId);
        })

        socket.on("close", () => {
          wsManager._handleUserDisconnection(socket, userId);
        })
      })
    })
  }

  // 添加心跳检测
  private _heartBeat(socket: WebSocket, userId: string) {
    // 设置ping间隔
    const pingInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        this._sendMessage(socket, userId, {
          type: MessageType.ping,
          data: { timestamp: Date.now() }
        });
      } else {
        clearInterval(pingInterval);
        this._handleUserDisconnection(socket, userId);
      }
    }, PING_INTERVAL);

    socket.on("close", () => {
      clearInterval(pingInterval);
    });
  }

  private _handleUserConnection(socket: WebSocket, userId: string) {
    const connectId = generateConnectionId();
    const userConnectionIdsMap = this._userConnectionIds.get(userId) || new Map<string, WebSocket>();
    userConnectionIdsMap.set(connectId, socket);

    const wsConnections = this._connections.get(userId) || new Set<WebSocket>();
    wsConnections.add(socket);

    this._connections.set(userId, wsConnections);
    this._userConnectionIds.set(userId, userConnectionIdsMap);

    this._heartBeat(socket, userId);

    this._sendMessage(socket, userId, {
      type: MessageType.connection,
      data: {
        success: true,
        connectId
      }
    });
  }

  private _handleMessage(socket: WebSocket, message: string, userId: string) {
    let MsgInfo: IMessage | null = null;

    try {
      MsgInfo = JSON.parse(message);
      MessageSchema.parse(MsgInfo);
    } catch (error) {
      this._sendError(socket, userId, "无效的消息格式");
      return;
    }

    const handled = wsEventBus.emit(MsgInfo.type as MessageType, MsgInfo.data, socket, userId);
    if (!handled) {
      this._sendError(socket, userId, "未知的消息类型");
    }
  }

  private _handleUserDisconnection(socket: WebSocket, userId: string) {
    // 从用户的连接集合中移除
    const userConns = this._connections.get(userId);
    if (userConns) {
      userConns.delete(socket);
      if (userConns.size === 0) {
        this._connections.delete(userId);
      }
    }

    // 从connectionId映射中移除
    const userConnMap = this._userConnectionIds.get(userId);
    if (userConnMap) {
      // 查找并删除对应的connectionId
      for (const [connId, ws] of userConnMap.entries()) {
        if (ws === socket) {
          userConnMap.delete(connId);
          break;
        }
      }

      if (userConnMap.size === 0) {
        this._userConnectionIds.delete(userId);
      }
    }
  }

  private _sendError(socket: WebSocket, userId: string, message: string) {
    this._sendMessage(socket, userId, {
      type: MessageType.error,
      data: {
        message
      }
    });
  }

  private _sendMessage(socket: WebSocket, userId: string, message: IMessage) {
    socket.send(JSON.stringify(message));
  }

  sendMessageToUser(userId: string, message: IMessage) {
    const userConns = this._connections.get(userId);
    if (userConns) {
      userConns.forEach(conn => this._sendMessage(conn, userId, message));
    }
  }
}

const getWebSocketManager = WebSocketManager.getInstance;

export default getWebSocketManager;
