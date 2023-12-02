import database from "infra/database.js";

async function status(req, res) {
  const updatedAt = new Date().toISOString();
  const version = (
    await database.query("SELECT split_part(version(), ' ', 2);")
  ).rows[0].split_part;

  const maxConnections = (await database.query("SHOW max_connections;")).rows[0]
    .max_connections;

  const openedConnections = (
    await database.query("SELECT * FROM pg_stat_activity;")
  ).rows.length;

  res.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      version,
      max_connections: +maxConnections,
      opened_connections: openedConnections,
    },
  });
}

export default status;
