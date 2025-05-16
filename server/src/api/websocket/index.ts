import { FastifyInstance } from 'fastify';
import getWebSocketManager from './wsManger';

import './handlers';
export const initWs = (app: FastifyInstance) => {
  getWebSocketManager().init(app);
}

export default initWs;