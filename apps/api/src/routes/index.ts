import type { FastifyInstance } from "fastify";

export async function registerRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return { message: "API do Projeto SaaS" };
  });
}
