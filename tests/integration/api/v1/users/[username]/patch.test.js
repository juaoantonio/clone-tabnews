import orchestrator from "tests/orchestrator.js";
import password from "models/password.js";
import user from "models/user.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With unique 'username'", async () => {
      const { email } = await orchestrator.createUser({
        username: "uniqueuser",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueuser",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueuser2",
          }),
        },
      );
      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueuser2",
        email: email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      const isMarkedAsUpdated =
        responseBody.updated_at > responseBody.created_at;
      expect(isMarkedAsUpdated).toBe(true);
    });

    test("With unique 'email'", async () => {
      const { username } = await orchestrator.createUser({
        email: "uniqueemail@gmail.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "uniqueemail2@gmail.com",
          }),
        },
      );
      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: username,
        email: "uniqueemail2@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      const isMarkedAsUpdated =
        responseBody.updated_at > responseBody.created_at;
      expect(isMarkedAsUpdated).toBe(true);
    });

    test("With new 'password'", async () => {
      const { username, email } = await orchestrator.createUser({
        password: "oldpassword",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "newpassword",
          }),
        },
      );
      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: username,
        email: email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      const createdUser = await user.findOneByUsername(username);
      const isPasswordCorrect = await password.compare(
        "newpassword",
        createdUser.password,
      );
      const isPasswordIncorrect = await password.compare(
        "oldpassword",
        createdUser.password,
      );
      expect(isPasswordCorrect).toBe(true);
      expect(isPasswordIncorrect).toBe(false);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      const isMarkedAsUpdated =
        responseBody.updated_at > responseBody.created_at;
      expect(isMarkedAsUpdated).toBe(true);
    });

    test("With non existent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/notfound",
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "PATCH",
        },
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

    test("With duplicated 'username'", async () => {
      await orchestrator.createUser({
        username: "user1",
      });

      await orchestrator.createUser({
        username: "user2",
      });

      const response = await fetch("http://localhost:3000/api/v1/users/user2", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
        }),
      });
      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Esse username já está cadastrado.",
        action: "Use um username diferente para essa ação.",
        status_code: 400,
      });
    });

    test("With duplicated 'email'", async () => {
      await orchestrator.createUser({
        email: "email1@gmail.com",
      });

      const { username } = await orchestrator.createUser({
        email: "email2@gmail.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "email1@gmail.com",
          }),
        },
      );
      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Esse email já está cadastrado.",
        action: "Use um email diferente para essa ação.",
        status_code: 400,
      });
    });

    test("With same 'username' but different case", async () => {
      await orchestrator.createUser({
        username: "CaseUser",
        email: "caseuser@example.com",
        password: "ayt27%4",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/caseuser",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "caseuser",
          }),
        },
      );

      expect(response.status).toBe(200);
    });
  });
});
