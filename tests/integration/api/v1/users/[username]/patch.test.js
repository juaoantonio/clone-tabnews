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
      const userResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueuser",
          email: "uniqueuser@gmail.com",
          password: "senha1",
        }),
      });
      expect(userResponse.status).toBe(201);

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
        email: "uniqueuser@gmail.com",
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
      const userResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueemailuser",
          email: "uniqueemail@gmail.com",
          password: "senha1",
        }),
      });
      expect(userResponse.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueemailuser",
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
        username: "uniqueemailuser",
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
      const userResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "newPasswordUser",
          email: "newpassword@gmail.com",
          password: "senha1",
        }),
      });
      expect(userResponse.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/newPasswordUser",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "senha2",
          }),
        },
      );
      expect(response.status).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "newPasswordUser",
        email: "newpassword@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      const createdUser = await user.findOneByUsername("newPasswordUser");
      const isPasswordCorrect = await password.compare(
        "senha2",
        createdUser.password,
      );
      const isPasswordIncorrect = await password.compare(
        "senha1",
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
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
          email: "user1@gmail.com",
          password: "senha1",
        }),
      });
      expect(user1Response.status).toBe(201);

      const user2Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user2",
          email: "user2@gmail.com",
          password: "senha1",
        }),
      });
      expect(user2Response.status).toBe(201);

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
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email1",
          email: "email1@gmail.com",
          password: "senha1",
        }),
      });
      expect(user1Response.status).toBe(201);

      const user2Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email2",
          email: "email2@gmail.com",
          password: "senha2",
        }),
      });
      expect(user2Response.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/email2",
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
      const user = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "CaseUser",
          email: "caseuser@example.com",
          password: "ayt27%4",
        }),
      });
      expect(user.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/CaseUser",
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
