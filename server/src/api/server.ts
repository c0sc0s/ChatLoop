import Fastify from "fastify";
import routes from "./routes";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { loggerConfig } from "./config";
import "dotenv/config";
import registerPlugins from "./plugins";
import initWs from "./websocket";
export const BASE_URL = process.env.BASE_URL || "";

const server = Fastify({
  logger: loggerConfig,
});

// 设置 Zod 作为验证和序列化器
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

registerPlugins(server);

// 注册路由
server.register(routes, { prefix: BASE_URL });

initWs(server);

export { server };
