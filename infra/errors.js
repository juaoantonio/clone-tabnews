export class InternalServerError extends Error {
  constructor({ cause, statusCode }) {
    super("Um erro interno não esperado ocorreu.", {
      cause,
    });
    this.name = "InternalServerError";
    this.action = "Tente novamente mais tarde ou contate o suporte.";
    this.statusCode = statusCode || 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class MethodNotAllowedError extends Error {
  constructor() {
    super("Método não permitido para este endpoint.");
    this.name = "MethodNotAllowedError";
    this.action = "Verifique a documentação da API para mais informações.";
    this.statusCode = 405;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ServiceUnavailableError extends Error {
  constructor({ cause, message, action } = {}) {
    super(message || "O serviço está temporariamente indisponível.", {
      cause,
    });
    this.name = "ServiceUnavailableError";
    this.action = action || "Tente novamente mais tarde.";
    this.statusCode = 503;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
export class ValidationError extends Error {
  constructor({ cause, message, action } = {}) {
    super(message || "Ocorreu um erro de validação com os dados enviados", {
      cause,
    });
    this.name = "ValidationError";
    this.action = action || "Ajuste os dados e tente novamente.";
    this.statusCode = 400;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
export class NotFoundError extends Error {
  constructor({ cause, message, action } = {}) {
    super(message || "Não foi encontrado este recurso no sistema.", {
      cause,
    });
    this.name = "NotFoundError";
    this.action = action || "Verifique os parâmetros e tente novamente.";
    this.statusCode = 404;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
