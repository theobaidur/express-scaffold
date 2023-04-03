/**
 * ControllerResponse is a class that is used to return a response from a controller.
 */
export default class ControllerResponse {
  /**
   * Indicates if the response is a stream
   * @type {boolean} - true if the response is a stream
   */
  is_stream: boolean = false;
  /**
   * The name of the file to be downloaded
   * Used when is_stream is true
   * @type {string} - the name of the file to be downloaded
   */
  file_name: string = "";
  /**
   * The type of the file to be downloaded
   * Used when is_stream is true
   * @type {string} - the type of the file to be downloaded
   * @example - application/pdf
   * @example - image/png
   * @default - application/octet-stream
   **/
  file_type: string = "";
  /**
   * Indicates if the response is a redirect
   * @type {boolean} - true if the response is a redirect
   **/
  is_redirect: boolean = false;
  /**
   * The url to redirect to
   * Used when is_redirect is true
   * @type {string} - the url to redirect to
   */
  redirect_url: string = "";
  constructor(
    /**
     * The message to be returned
     * A meaningful message is always helpful for the client
     * @type {string} - the message to be returned
     */
    public message?: string,
    /**
     * The status code to be returned
     * @type {number} - the status code to be returned
     */
    private _code?: number,
    /**
     * The data to be returned
     * @type {any} - the data to be returned
     */
    public data?: any,
    /**
     * The meta data to be returned
     * Meta data is any additional data that can be useful to the client
     * For example, pagination data, total number of records, etc.
     * Where the data is an array, the meta data can be used to return pagination data like the current page, total number of pages, etc.
     * @type {any} - the meta data to be returned
     * @example - pagination data
     * @example - total number of records
     **/
    public meta?: any,
    /**
     * The error to be returned
     * @type {any} - the error to be returned
     * @example - validation errors
     * @example - database errors
     * @example - any other errors
     * @default - undefined
     * */
    public error?: any
  ) {
    Object.setPrototypeOf(this, ControllerResponse.prototype);
    // validate the status code to be between 200 and 600
    if (this._code && (this._code < 200 || this._code >= 600)) {
      throw new Error("Invalid status code");
    }
  }

  /**
   * The status code to be returned, it also validates the status code to be between 200 and 600
   * It's important we set proper status codes to the response based on the type of response.
   * For example, if the response is a redirect, the status code should be 3XX.
   * If the response is an error, the status code should be 4XX or 5XX.
   * If the response is a success, the status code should be 2XX.
   * If the status code isn't set properly, the client may not be able to handle the response properly.
   * @type {number} - the status code to be returned
   * @default - 200
   */
  get code() {
    let tmp = this._code;
    if (!tmp) {
      // if the status code is not provided, it will be set to 1000 which is an invalid status code.
      // we will fix this invalidation below based on the other properties of the ControllerResponse
      tmp = 1000;
    }
    // if there is an error, the code is not 4XX or 5XX, we will set the code to 500
    if(this.error && !(tmp < 400 || tmp >= 600)) {
      return 500;
    }
    // if is_redirect is true, the code is not 3XX, we will set the code to 302
    if(this.is_redirect && !(tmp >= 300 && tmp < 400)) {
      return 302;
    }
    // no error, no redirect, the code is not 2XX, we will set the code to 200
    if (tmp < 200 || tmp >= 600) {
      return 200;
    }
    return tmp;
  }

  set code(code: number) {
    // validate the status code to be between 200 and 600
    if (code < 200 || code >= 600) {
      this._code = 200;
    } else {
      throw new Error("Invalid status code");
    }
  }

  /**
   * 
   * @returns - a JSON representation of the ControllerResponse
   */
  toJSON() {
    return {
      success: this.code >= 200 && this.code < 300,
      message: this.message,
      code: this.code,
      data: this.data,
      meta: this.meta,
      error: this.error,
    };
  }

  /**
   * A helper method to return a success response
   * @param data {any} - any data to be returned
   * @param meta {any} - any meta data to be returned
   * @param message {string} - any meaningful message to be returned 
   * @returns {ControllerResponse} - a ControllerResponse object
   */
  static success(data?: any, meta?: any, message: string = "Success", code: number = 200): ControllerResponse {
    return new ControllerResponse(message, 200, data, meta);
  }

  /**
   * A helper method to return a failure response
   * @param errors {any} - any errors to be returned
   * @param code {number} - the status code to be returned
   * @param message {string} - any meaningful message to be returned
   * @returns {ControllerResponse} - a ControllerResponse object
   * @default - code = 400
   * @default - message = "Failed"
   * @example - ControllerResponse.error("Invalid email address", 400, "Failed")
   **/
  static error(errors?: any, code: number = 400, message: string = "Failed"): ControllerResponse {
    if (code < 400 || code >= 600) {
      code = 400;
    }
    return new ControllerResponse(message, code, undefined, undefined, errors);
  }

  /**
   * A helper method to return a stream response
   * Usefull when you want to send a file to the client for download
   * @param file_name {string} - the name of the file to be downloaded
   * @param data {any} - the data to be sent, usually a buffer
   * @param file_type {string} - the type of the file to be downloaded
   * @param message {string} - any meaningful message to be returned
   * @returns {ControllerResponse} - a ControllerResponse object
   * @default - file_type = "application/octet-stream"
   * @default - message = "Success"
   * @example - ControllerResponse.stream("file.pdf", data, "application/pdf", "Success")
   * @example - ControllerResponse.stream("file.png", data, "image/png", "Success")
   **/
  static stream(file_name: string, data: any, file_type?: string, message: string = "Success"): ControllerResponse {
    const response = new ControllerResponse(message, 200, data);
    response.is_stream = true;
    response.file_name = file_name;
    response.file_type = file_type || "application/octet-stream";
    return response;
  }

  /**
   * A helper method to return a redirect response
   * @param url {string} - the url to redirect to
   * @param code {number} - the status code to be returned, must be between 300 and 400, otherwise browser will ignore the redirect
   * @returns {ControllerResponse} - a ControllerResponse object
   * @default - code = 302
   * @example - ControllerResponse.redirect("https://www.google.com", 301)
   * @example - ControllerResponse.redirect("https://www.google.com")
   **/
  static redirect(url: string, code: number = 302): ControllerResponse {
    // validate the code
    if (code < 300 || code >= 400) {
      code = 302;
    }
    const response = new ControllerResponse("Redirecting", code);
    response.is_redirect = true;
    response.redirect_url = url;
    return response;
  }
}
