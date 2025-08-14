import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import database from "@infra/database";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "juaoantonio",
          email: "joaom@gmail.com",
          password: "senha1",
        }),
      });
      expect(response.status).toBe(201);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "juaoantonio",
        email: "joaom@gmail.com",
        password: "senha1",
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const createdUser = (
        await database.query({
          text: `SELECT * FROM users WHERE id=$1`,
          values: [responseBody.id],
        })
      ).rows[0];
      expect(uuidVersion(createdUser.id)).toBe(4);
      expect(createdUser.username).toBe("juaoantonio");
      expect(createdUser.email).toBe("joaom@gmail.com");
      expect(createdUser.password).toBe("senha1");
      expect(Date.parse(createdUser.created_at)).not.toBeNaN();
      expect(Date.parse(createdUser.updated_at)).not.toBeNaN();
    });

    test("With duplicated email", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "juaoantonio1",
          email: "duplicado@gmail.com",
          password: "senha1",
        }),
      });
      expect(response1.status).toBe(201);
      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "juaoantonio2",
          email: "Duplicado@gmail.com",
          password: "senha1",
        }),
      });
      expect(response2.status).toBe(400);
      const response2Body = await response2.json();
      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "Esse email já está cadastrado.",
        action: "Use um email diferente no cadastro.",
        status_code: 400,
      });
    });

    test("With duplicated username", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "username_duplicado",
          email: "test1@gmail.com",
          password: "senha1",
        }),
      });
      expect(response1.status).toBe(201);
      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "username_duplicadO",
          email: "test2@gmail.com",
          password: "senha1",
        }),
      });
      expect(response2.status).toBe(400);
      const response2Body = await response2.json();
      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "Esse username já está cadastrado.",
        action: "Use um username diferente no cadastro.",
        status_code: 400,
      });
    });
  });
});
