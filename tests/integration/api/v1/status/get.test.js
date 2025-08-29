import orchestrator from "../../../../orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("GET /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retrieving system status", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status");
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody.updated_at).toBeDefined();

      const {
        updated_at,
        dependencies: {
          database: { version, max_connections, opened_connections },
        },
      } = responseBody;
      const parsedUpdatedAt = new Date(updated_at).toISOString();

      expect(updated_at).toEqual(parsedUpdatedAt);
      expect(version).toBeTruthy();
      expect(max_connections).toBeGreaterThan(0);
      expect(opened_connections).toEqual(1);
    });
  });
});
