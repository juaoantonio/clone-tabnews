import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With exact case match", async () => {
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "MatchCase",
          email: "match.case@gmail.com",
          password: "senha1",
        }),
      });
      const response = await fetch(
        "http://localhost:3000/api/v1/users/MatchCase",
      );
      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "MatchCase",
        email: "match.case@gmail.com",
        password: "senha1",
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
    });
    test("With not exact case match", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/matchcase",
      );
      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "MatchCase",
        email: "match.case@gmail.com",
        password: "senha1",
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
    });
    test("With non existant username", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/notfound",
      );
      expect(response.status).toBe(404);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Usuário não encontrado.",
        action: "Verifique se username informado foi digitado corretamente.",
        status_code: 404,
      });
    });
  });
});
