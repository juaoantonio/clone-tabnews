import {
  InternalServerError,
  MethodNotAllowedError,
  ValidationError,
} from "./errors";

function onNoMatchHandler(req, res) {
  const publicError = new MethodNotAllowedError();
  res.status(publicError.statusCode).json(publicError);
}

function onErrorHandler(err, req, res) {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(err);
  }
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
