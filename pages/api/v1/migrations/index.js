import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

const ALLOWED_METHODS = ["GET", "POST"];

export default async function migrations(req, res) {
  if (!ALLOWED_METHODS.includes(req.method)) {
    return res.status(405).json({
      error:
        `Method ${req.method} not allowed. Allowed methods are: GET, POST.`,
    });
  }

  let dbClient;
  try {
    dbClient = await database.getNewClient();
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

      return res.status(200).json(pendingMigrations);
    }

    if (reqMethod === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      });

      const created = migratedMigrations.length > 0;
      const status = created ? 201 : 200;

      return res.status(status).json(migratedMigrations);
    }
  } catch (error) {
    console.error("Error running migrations:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (dbClient) dbClient.end();
  }
}
