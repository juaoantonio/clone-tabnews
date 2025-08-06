import { createRouter } from "next-connect";
import {
  InternalServerError,
  MethodNotAllowedError,
  ServiceUnavailableError,
} from "infra/errors";
import database from "infra/database";

const router = createRouter();
router.get(getHandler);
router.post(postHandler);

function onNoMatchHandler(req, res) {
  const publicError = new MethodNotAllowedError();
  res.status(publicError.statusCode).json(publicError);
}

function onNoErrorHandler(err, req, res) {
  let publicError;
  if (err instanceof ServiceUnavailableError) {
    publicError = err;
  } else {
    publicError = new InternalServerError({
      cause: err,
    });
  }
  console.error(publicError);
  res.status(publicError.statusCode).json(publicError);
}

export default router.handler({
  onNoMatch: onNoMatchHandler,
  onError: onNoErrorHandler,
});

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
