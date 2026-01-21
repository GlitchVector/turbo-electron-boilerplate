import type { FastifyInstance } from "fastify";
import { APP_NAME, APP_VERSION } from "@repo/shared";

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get("/health", async () => {
    return {
      status: "ok",
      name: APP_NAME,
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
    };
  });
}
