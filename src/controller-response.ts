export default class ControllerResponse {
  has_downloadable_data: boolean = false;
  file_name: string = "";
  file_type: string = "";
  constructor(
    public message: string,
    public code: number = 200,
    public data?: any,
    public meta?: any,
    public errors?: any
  ) {
    Object.setPrototypeOf(this, ControllerResponse.prototype);
  }

  toJSON() {
    return {
      success: this.code >= 200 && this.code < 300,
      message: this.message,
      code: this.code,
      data: this.data,
      meta: this.meta,
      errors: this.errors,
    };
  }

  static ok(message: string = "OK", data?: any, meta?: any) {
    return new ControllerResponse(message, 200, data, meta);
  }

  static created(
    message: string = "Item created successfully",
    data?: any,
    meta?: any
  ) {
    return new ControllerResponse(message, 201, data, meta);
  }

  static updated(
    message: string = "Item updated successfully",
    data?: any,
    meta?: any
  ) {
    return new ControllerResponse(message, 200, data, meta);
  }

  static deleted(
    message: string = "Item deleted successfully",
    data?: any,
    meta?: any
  ) {
    return new ControllerResponse(message, 200, data, meta);
  }

  static withSuccess(...message: string[]) {
    return (data?: any, meta?: any) => {
      return new ControllerResponse(message.join("."), 200, data, meta);
    };
  }

  static withError(message: string, code = 400) {
    return (errors?: any) => {
      // make sure code is 4xx or 5xx
      if (code < 400 || code >= 600) {
        code = 400;
      }
      return new ControllerResponse(
        message,
        code,
        undefined,
        undefined,
        errors
      );
    };
  }

  static withDownloadableData(file_name: string, file_type?: string) {
    return (data: any) => {
      const response = new ControllerResponse("Ready for download", 200, data);
      response.has_downloadable_data = true;
      response.file_name = file_name;
      response.file_type = file_type || "application/octet-stream";
      return response;
    };
  }
}
