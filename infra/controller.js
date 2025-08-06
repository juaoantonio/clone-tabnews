import {
  InternalServerError,
  MethodNotAllowedError,
  ServiceUnavailableError,
} from "./errors";

function onNoMatchHandler(req, res) {
  const publicError = new MethodNotAllowedError();
  res.status(publicError.statusCode).json(publicError);
}

function onErrorHandler(err, req, res) {
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

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

export default controller;
