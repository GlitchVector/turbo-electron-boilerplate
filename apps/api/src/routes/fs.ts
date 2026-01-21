import type { FastifyInstance } from "fastify";
import { readFile, writeFile, access } from "fs/promises";
import { constants } from "fs";

export async function fsRoutes(fastify: FastifyInstance) {
  // Read file
  fastify.get<{ Querystring: { path: string } }>("/read", async (request, reply) => {
    const { path } = request.query;

    if (!path) {
      return reply.status(400).send({ error: "Path is required" });
    }

    try {
      const content = await readFile(path, "utf-8");
      return reply.type("text/plain").send(content);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return reply.status(404).send({ error: `Failed to read file: ${message}` });
    }
  });

  // Write file
  fastify.post<{ Body: { path: string; content: string } }>("/write", async (request, reply) => {
    const { path, content } = request.body;

    if (!path || content === undefined) {
      return reply.status(400).send({ error: "Path and content are required" });
    }

    try {
      await writeFile(path, content, "utf-8");
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return reply.status(500).send({ error: `Failed to write file: ${message}` });
    }
  });

  // Check if file exists
  fastify.get<{ Querystring: { path: string } }>("/exists", async (request, reply) => {
    const { path } = request.query;

    if (!path) {
      return reply.status(400).send({ error: "Path is required" });
    }

    try {
      await access(path, constants.F_OK);
      return { exists: true };
    } catch {
      return { exists: false };
    }
  });
}
