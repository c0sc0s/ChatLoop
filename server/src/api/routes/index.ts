import { FastifyPluginAsync } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import authRoutes from "./auth";
import userRoutes from "./user";
import healthRoutes from "./health";
import friendRoutes from "./friends";
import chatRoutes from "./chat";
import groupRoutes from "./groups";
import rtcRoutes from "./rtc";

interface RouteConfig {
  prefix?: string;
  routes: FastifyPluginAsync;
}

const routeConfigs: RouteConfig[] = [
  {
    prefix: "/auth",
    routes: authRoutes,
  },
  {
    prefix: "/users",
    routes: userRoutes,
  },
  {
    prefix: "/friends",
    routes: friendRoutes,
  },
  {
    prefix: "/chat",
    routes: chatRoutes,
  },
  {
    prefix: "/groups",
    routes: groupRoutes,
  },
  {
    prefix: "/rtc",
    routes: rtcRoutes,
  },
  {
    routes: healthRoutes,
  },
];

const routes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  for (const routeConfig of routeConfigs) {
    app.register(routeConfig.routes, { prefix: routeConfig.prefix || "" });
  }
};

export default routes;
