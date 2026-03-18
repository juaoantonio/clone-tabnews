import orchestrator from "tests/orchestrator.js";
import { TestApiClient } from "@tests/test-api-client";
import { version as uuidVersion } from "uuid";
import session from "@models/session";
import setCookieParser from "set-cookie-parser";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/sessions", () => {
  describe("Anonymous user", () => {
    test("With incorrect `email` but correct `password`", async () => {
      await orchestrator.createUser({
        password: "senha-correta",
      });

      const response = await TestApiClient.post("/sessions", {
        email: "incorreto@email.com",
        password: "senha-correta",
      });
      expect(response.status).toBe(401);
      expect(response.data).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação incorretos.",
        action: "Verifique os dados de autenticação e tente novamente.",
        status_code: 401,
      });
    });

    test("With correct `email` but incorrect `password`", async () => {
      await orchestrator.createUser({
        email: "correto@email.com",
      });

      const response = await TestApiClient.post("/sessions", {
        email: "correto@email.com",
        password: "senha-incorreta",
      });
      expect(response.status).toBe(401);
      expect(response.data).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação incorretos.",
        action: "Verifique os dados de autenticação e tente novamente.",
        status_code: 401,
      });
    });

    test("With incorrect `email` and incorrect `password`", async () => {
      await orchestrator.createUser({});

      const response = await TestApiClient.post("/sessions", {
        email: "incorreto@email.com",
        password: "senha-incorreta",
      });
      expect(response.status).toBe(401);
      expect(response.data).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação incorretos.",
        action: "Verifique os dados de autenticação e tente novamente.",
        status_code: 401,
      });
    });

    test("With correct `email` and correct `password`", async () => {
      const createdUser = await orchestrator.createUser({
        email: "tudo-correto@email.com",
        password: "senha-correta",
      });

      const response = await TestApiClient.post("/sessions", {
        email: "tudo-correto@email.com",
        password: "senha-correta",
      });
      expect(response.status).toBe(201);
      expect(response.data).toEqual({
        id: expect.any(String),
        token: expect.any(String),
        user_id: createdUser.id,
        expires_at: expect.any(String),
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
      expect(uuidVersion(response.data.id)).toBe(4);
      expect(Date.parse(response.data.created_at)).not.toBeNaN();
      expect(Date.parse(response.data.updated_at)).not.toBeNaN();
      expect(Date.parse(response.data.expires_at)).not.toBeNaN();

      const expiresAt = new Date(response.data.expires_at);
      const createdAt = new Date(response.data.created_at);
      expiresAt.setSeconds(0, 0);
      createdAt.setSeconds(0, 0);
      expect(expiresAt - createdAt).toBe(session.EXPIRATION_IN_MILLISECONDS);

      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });
      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: response.data.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });
  });
});
