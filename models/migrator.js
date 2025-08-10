import { resolve } from "node:path";
import migrationRunner from "node-pg-migrate";
import { ServiceUnavailableError } from "../infra/errors";
import database from "../infra/database";

const defaultMigrationOptions = {
  dir: resolve("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function listPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    return await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: true,
      dbClient,
    });
  } catch (error) {
    const serviceUnavailableError = new ServiceUnavailableError({
      message: "Não foi posssível listar as migrações pendentes.",
      cause: error,
    });
    console.error(serviceUnavailableError);
    throw serviceUnavailableError;
  } finally {
    dbClient?.end();
  }
}

async function runPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    return await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: false,
      dbClient,
    });
  } catch (error) {
    const serviceUnavailableError = new ServiceUnavailableError({
      message: "Não foi posssível executar as migrações pendentes.",
      cause: error,
    });
    console.error(serviceUnavailableError);
    throw serviceUnavailableError;
  } finally {
    dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
