import orchestrator from "tests/orchestrator.js";
import { TestApiClient } from "@tests/test-api-client";
import { v4 as uuidv4 } from "uuid";
import session from "@models/session";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/user", () => {
  describe("Default user", () => {
    test("With valid session", async () => {
      const userRecord = await orchestrator.createUser({
        username: "ValidSessionUser",
      });
      const newSession = await orchestrator.createSession(userRecord.id);

      const response = await TestApiClient.get(
        "http://localhost:3000/api/v1/user",
        {
          headers: {
            Cookie: `session_id=${newSession.token}`,
          },
        },
      );
      expect(response.status).toBe(200);
      const responseBody = response.data;
      expect(responseBody).toEqual({
        id: userRecord.id,
        username: "ValidSessionUser",
        email: userRecord.email,
        password: userRecord.password,
        created_at: userRecord.created_at.toISOString(),
        updated_at: userRecord.updated_at.toISOString(),
      });
    });

    test("With inexistent session", async () => {
      const inexistentSessionToken = uuidv4();

      const response = await TestApiClient.get(
        "http://localhost:3000/api/v1/user",
        {
          headers: {
            Cookie: `session_id=${inexistentSessionToken}`,
          },
        },
      );
      const responseBody = response.data;
      expect(response.status).toBe(401);
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se esse usuário está logado e tente novamente.",
        status_code: 401,
      });
    });

    test("With expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
      });
      const userRecord = await orchestrator.createUser({
        username: "ExpiredSessionUser",
      });
      const newSession = await orchestrator.createSession(userRecord.id);
      jest.useRealTimers();

      const response = await TestApiClient.get(
        "http://localhost:3000/api/v1/user",
        {
          headers: {
            Cookie: `session_id=${newSession.token}`,
          },
        },
      );
      expect(response.status).toBe(401);
      const responseBody = response.data;
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se esse usuário está logado e tente novamente.",
        status_code: 401,
      });
    });
  });
});
