import { createRouter } from "next-connect";
import database from "infra/database";
import controller from "infra/controller";

const router = createRouter();
router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(req, res) {
  const pendingMigrations = await database.migrationRun(
    database.getDefaultMigrationOptions(),
  );
  return res.status(200).json(pendingMigrations);
}

async function postHandler(req, res) {
  const pendingMigrations = await database.migrationRun({
    ...database.getDefaultMigrationOptions(),
    dryRun: false,
  });

  if (pendingMigrations.length === 0) {
    return res.status(200).json(pendingMigrations);
  }

  return res.status(201).json(pendingMigrations);
}
