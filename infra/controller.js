import { InternalServerError, MethodNotAllowedError } from "./errors";

function onNoMatchHandler(req, res) {
  const publicError = new MethodNotAllowedError();
  res.status(publicError.statusCode).json(publicError);
}

function onErrorHandler(err, req, res) {
  const publicError = new InternalServerError({
    statusCode: err.statusCode,
    cause: err,
  });

  console.error(publicError);
  res.status(publicError.statusCode).json(publicError);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

export default controller;
