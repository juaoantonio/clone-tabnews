import { Client } from "pg";
import { resolve } from "node:path";
import migrationRunner from "node-pg-migrate";
import { ServiceUnavailableError } from "./errors";

async function query(queryObject) {
  let client;
  try {
    client = await getNewClient();
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    const publicError = new ServiceUnavailableError({
      cause: error,
    });
    console.error(publicError);
    throw publicError;
  } finally {
    await client?.end();
  }
}

async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: process.env.NODE_ENV !== "production" ? false : true,
  });

  await client.connect();

  return client;
}

function getDefaultMigrationOptions() {
  return {
    dryRun: true,
    dir: resolve("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };
}

async function migrationRun(options) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    return await migrationRunner({
      ...options,
      dbClient,
    });
  } catch (error) {
    const publicError = new ServiceUnavailableError({
      cause: error,
    });
    console.error(publicError);
    throw publicError;
  } finally {
    dbClient?.end();
  }
}

const database = {
  getNewClient,
  query,
  getDefaultMigrationOptions,
  migrationRun,
};

export default database;
