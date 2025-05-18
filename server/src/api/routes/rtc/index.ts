import { FastifyInstance } from "fastify";
import response from "@/api/utils/response";

/**
 * WebRTC相关路由
 */
export default async function rtcRoutes(fastify: FastifyInstance) {
  // 获取STUN/TURN服务器配置
  fastify.get("/ice-servers", {
    onRequest: [fastify.authenticate],
    handler: async (request, reply) => {
      // 简单配置，使用公共STUN服务器
      const iceServers = [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ];

      return response.success(reply, { iceServers });
    }
  });
}