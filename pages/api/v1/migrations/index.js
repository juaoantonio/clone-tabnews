import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

export default async function migrations(req, res) {
  const dbClient = await database.getNewClient();
  const defaultMigrationOptions = {
    dbClient,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  const reqMethod = req.method;

  if (reqMethod === "GET") {
    const pendingMigrations = await migrationRunner(defaultMigrationOptions);
    await dbClient.end();

    return res.status(200).json(pendingMigrations);
  }

  if (reqMethod === "POST") {
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: false,
    });
    await dbClient.end();

    const created = migratedMigrations.length > 0;
    const status = created ? 201 : 200;

    return res.status(status).json(migratedMigrations);
  }

  return res.status(405).end();
}
