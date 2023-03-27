import ControllerResponse from "./controller-response";

export default class ControllerError extends Error {
  constructor(
    public message: string,
    public code: number = 400,
    public errors?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, ControllerError.prototype);
  }

  toJSON() {
    return ControllerResponse.withError(
      this.message,
      this.code
    )(this.errors).toJSON();
  }

  static badRequest(message: string = "Bad Request", errors?: any) {
    return new ControllerError(message, 400, errors);
  }

  static unauthorized(message: string = "Unauthorized") {
    return new ControllerError(message, 401);
  }

  static forbidden(message: string = "Forbidden") {
    return new ControllerError(message, 403);
  }

  static notFound(message: string = "Not Found") {
    return new ControllerError(message, 404);
  }

  static error(message: string = "Something went wrong") {
    return new ControllerError(message, 400);
  }
}
