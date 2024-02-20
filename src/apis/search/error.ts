export class ApiBadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiBadRequestError';
  }
}

export class ApiUnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiUnauthorizedError';
  }
}

export class ApiForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiForbiddenError';
  }
}

export class ApiTooManyRequestsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiTooManyRequestsError';
  }
}

export class ApiInternalServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiInternalServerError';
  }
}

export class ApiBadGatewayError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiBadGatewayError';
  }
}

export class ApiServiceUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiServiceUnavailableError';
  }
}

export class ApiInvalidParameterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiInvalidParameterError';
  }
}

export class ApiInvalidRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiInvalidRequestError';
  }
}

export class ApiSystemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiSystemError';
  }
}
