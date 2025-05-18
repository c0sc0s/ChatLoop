import clientLocalStorage from "@/core/util/localStorage";
import wsEventBus from "./wsEventBus";
import { WsConnectionStatus } from "../store/app";
import useAppStore from "../store/app";
import "./handlers";
import type { IWsMessage } from "./type";

const wsUrl = "ws://localhost:3001/ws/connect";

class WsClient {
  public static instance: WsClient;
  private ws: WebSocket | null = null;
  private url: string;
  private token: string;

  constructor() {
    this.url = wsUrl;
    this.token = clientLocalStorage.getAuthToken()!;
  }

  init() {
    this._connect();
  }

  public static getInstance() {
    if (!WsClient.instance) {
      WsClient.instance = new WsClient();
    }
    return WsClient.instance;
  }

  private _connect() {
    this.ws = new WebSocket(this.url + "?token=" + this.token);
    this.ws.onmessage = this._messageHandler.bind(this);
    this.ws.onerror = this._errorHandler.bind(this);
    this.ws.onopen = this._openHandler.bind(this);
  }

  private _openHandler() {
    useAppStore.setState({ wsConnectionStatus: WsConnectionStatus.CONNECTED });
    console.log("WebSocket连接成功");
  }

  private _messageHandler(event: MessageEvent) {
    const msgInfo = JSON.parse(event.data);
    wsEventBus.emit(msgInfo.type, msgInfo.data);
  }

  private _errorHandler(event: Event) {
    console.error("WebSocket错误", event);
  }

  closeSocket() {
    this.ws?.close();
  }

  sendMessage(msgInfo: IWsMessage) {
    if (!this.ws) {
      return;
    }
    this.ws.send(JSON.stringify(msgInfo));
  }
}

const wsClient = WsClient.getInstance();

export default wsClient;

