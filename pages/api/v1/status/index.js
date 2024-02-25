import database from "infra/database.js";

async function status(req, res) {
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
      version,
      max_connections: +maxConnections,
      opened_connections: databaseOpenedConnections,
    },
  });
}

export default status;
