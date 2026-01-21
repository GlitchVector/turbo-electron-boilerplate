import type { FastifyInstance } from "fastify";

// Generate 1000 dummy entries
function generateDummyData(count: number) {
  const statuses = ["active", "inactive", "pending", "archived"];
  const departments = ["Engineering", "Sales", "Marketing", "HR", "Finance", "Operations"];
  const countries = ["USA", "UK", "Germany", "France", "Japan", "Australia", "Canada", "Brazil"];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    department: departments[Math.floor(Math.random() * departments.length)],
    country: countries[Math.floor(Math.random() * countries.length)],
    salary: Math.floor(Math.random() * 150000) + 50000,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    hireDate: new Date(
      2015 + Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    ).toISOString().split("T")[0],
    performance: Math.floor(Math.random() * 100),
  }));
}

// Cache the data so it's consistent across requests
const cachedData = generateDummyData(1000);

export async function dataRoutes(fastify: FastifyInstance) {
  // Get all data
  fastify.get("/users", async (request, reply) => {
    return {
      success: true,
      count: cachedData.length,
      data: cachedData,
    };
  });

  // Get paginated data
  fastify.get<{
    Querystring: { page?: string; limit?: string }
  }>("/users/paginated", async (request, reply) => {
    const page = parseInt(request.query.page || "1", 10);
    const limit = parseInt(request.query.limit || "100", 10);
    const offset = (page - 1) * limit;

    const paginatedData = cachedData.slice(offset, offset + limit);

    return {
      success: true,
      page,
      limit,
      total: cachedData.length,
      totalPages: Math.ceil(cachedData.length / limit),
      data: paginatedData,
    };
  });
}
