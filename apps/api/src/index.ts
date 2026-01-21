import Fastify from "fastify";
import cors from "@fastify/cors";
import { API_PORT } from "@repo/shared";
import { healthRoutes } from "./routes/health";
import { dataRoutes } from "./routes/data";

const fastify = Fastify({
  logger: true,
});

async function start() {
  // Register CORS for browser requests
  await fastify.register(cors, {
    origin: true,
  });

  // Register routes
  await fastify.register(healthRoutes, { prefix: "/api" });
  await fastify.register(dataRoutes, { prefix: "/api/data" });

  try {
    await fastify.listen({ port: API_PORT, host: "0.0.0.0" });
    console.log(`API server running at http://localhost:${API_PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
