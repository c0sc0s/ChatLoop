import dbPlugin from "./db";
import authPlugin from "./auth";
import corsPlugin from "./cors";
import { FastifyInstance } from "fastify";
import { publicPaths } from "../config";

const AppPlugins = [
  {
    plugin: corsPlugin,
  },
  {
    plugin: dbPlugin,
  },
  {
    plugin: authPlugin,
    options: {
      publicPaths: publicPaths,
    },
  },
];

const registerPlugins = (fastify: FastifyInstance) => {
  AppPlugins.forEach((plugin) => {
    fastify.register(plugin.plugin, plugin.options);
  });
};

export default registerPlugins;
