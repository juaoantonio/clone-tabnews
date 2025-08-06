import database from "infra/database.js";
import { InternalServerError, MethodNotAllowedError } from "infra/errors.js";
import { createRouter } from "next-connect";

const router = createRouter();
router.get(getHandler);

function onNoMatchHandler(req, res) {
  const publicError = new MethodNotAllowedError();
  res.status(publicError.statusCode).json(publicError);
}

function onNoErrorHandler(err, req, res) {
  const publicError = new InternalServerError({
    cause: err,
  });
  console.error(publicError);
  res.status(publicError.statusCode).json(publicError);
}

export default router.handler({
  onNoMatch: onNoMatchHandler,
  onError: onNoErrorHandler,
});

async function getHandler(req, res) {
  const updatedAt = new Date().toISOString();
  const version = (
    await database.query("SELECT split_part(version(), ' ', 2);")
  ).rows[0].split_part;

  const maxConnections = (await database.query("SHOW max_connections;")).rows[0]
    .max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const databaseOpenedConnectionsResult = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });

  const databaseOpenedConnections =
    databaseOpenedConnectionsResult.rows[0].count;

  res.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version,
        max_connections: +maxConnections,
        opened_connections: databaseOpenedConnections,
      },
    },
  });
}
