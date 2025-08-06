import { beforeAll, describe, expect, test } from "@jest/globals";
import orchestrator from "../../../../orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe("DELETE /api/v1/migrations", () => {
  test("For the first time", async () => {
    const response1 = await fetch("http://localhost:3000/api/v1/migrations", {
      method: "DELETE",
    });
    expect(response1.status).toBe(405);
    const responseBody = await response1.json();
    expect(responseBody).toEqual({
      name: "MethodNotAllowedError",
      message: "Método não permitido para este endpoint.",
      action: "Verifique a documentação da API para mais informações.",
      status_code: 405,
    });
  });
});
