import { FastifyInstance } from 'fastify';
import getWebSocketManager from './wsManger';
import { wsEventBus } from './wsEventBus';

import './handlers';
export const initWs = (app: FastifyInstance) => {
  wsEventBus.setFastify(app);

  // 初始化 WebSocket 管理器
  getWebSocketManager().init(app);
}

export default initWs;