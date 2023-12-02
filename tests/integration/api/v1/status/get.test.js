test("GET to /api/v1/status should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);

  const responseBody = await response.json();
  expect(responseBody.updated_at).toBeDefined();

  const {
    updated_at,
    dependencies: { version, max_connections, opened_connections },
  } = responseBody;

  const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
  expect(updated_at).toEqual(parsedUpdatedAt);

  expect(version).toBeTruthy();

  expect(max_connections).toBeGreaterThan(0);

  expect(opened_connections).toBeLessThanOrEqual(max_connections);
});
