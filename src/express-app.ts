import express from "express";
import listEndpoints from "express-list-endpoints";
import { checkSchema, validationResult } from "express-validator";
import ControllerResponse from "./controller-response";
import { BASE_PATH, ControllerMethod, RouteConfig, ROUTES } from "./decorators";
import { ExpressController } from "./express-controller";

type ExpressControllerClassType = new (...args: any[]) => ExpressController;


export class ExpressApp {
  constructor(
    private expressApp: express.Application = express(),
  ) {}
  /**
   * Add a controller to the express app
   * @param controller {ExpressController} - Controller to be registered
   */
  private registerController<T extends ExpressControllerClassType>(controller: T): void {
    const basePath = Reflect.getMetadata(BASE_PATH, controller);
    const routes: RouteConfig[] = Reflect.getMetadata(ROUTES, controller);
    const instance = new controller();
    routes.forEach((route) => {
      const { method, path, handlers, schema } = route;
      const routePath = `${basePath}${path}`;
      if (schema) {
        handlers.push(checkSchema(schema) as any);
      }
      this.expressApp[method](routePath, ...handlers, async (req, res) => {
        try {
          if (schema) {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
              const reducedError = errors.array().reduce((err, curr) => {
                if (!err[curr.param]) {
                  err[curr.param] = [];
                }
                err[curr.param].push(curr.msg);
                return err;
              }, {} as any);

              const { code, ...other } = ControllerResponse.error(
                reducedError,
                400,
                `Validation Error`
              ).toJSON();

              return res.status(code).json(other);
            }
          }
          const method = (instance as any)[route.key] as ControllerMethod;
          let result: ControllerResponse = await method(req, res);
          if (result.is_stream) {
            res.setHeader(
              "Content-Disposition",
              `attachment; filename=${result.file_name}`
            );
            res.setHeader("Content-Type", result.file_type);
            res.send(result.data);
          } else if (result.is_redirect) {
            res.redirect(result.code, result.redirect_url);

          } else {
            const { code, ...other } = result.toJSON();
            res.status(code).json(other);
          }
        } catch (e: any) {
          const message = e.message || "Internal Server Error";
          const { code, ...other } = ControllerResponse.error(
            null,
            500,
            message,
          ).toJSON();

          res.status(code).json(other);
        }
        console.log("Request", req.method, req.url);
      });
    });
  }

  /**
   * List all the routes registered in the express app
   * @param middlewareList {express.RequestHandler[]} - List of middleware to be added to the express app
   */
  useMiddleware(...middlewareList: express.RequestHandler[]): void {
    middlewareList.forEach((middleware) => {
      this.expressApp.use(middleware);
    });
  }

  /**
   * Add a list of controllers to the express app
   * @param controllers {ExpressController[]} - List of controllers to be registered
   * @returns {void}
   * */
  useController<T extends ExpressControllerClassType>(...controllers: T[]): void {
    controllers.forEach((controller) => {
      this.registerController(controller);
    });
  }

  /**
   * Any route that can't be defined by the controller can be added here
   * For example, a route to serve static files, or for a SPA, can be used to serve the index.html file
   * @param method {RouteConfig["method"]} - HTTP method
   * @param path {string} - Path of the route
   * @param handlers {RouteConfig["handlers"]} - List of handlers to be executed
   */
  useRoute(
    method: RouteConfig["method"],
    path: string,
    ...handlers: RouteConfig["handlers"]
  ): void {
    this.expressApp[method](path, ...handlers);
  }

  /**
   * Start the express app
   * @param port {number} - Port number to listen on
   * @param callback {()=>void} - Callback to be executed after the server starts
   * @returns {Promise<void>}
   * */
  listen(port: number = 3000, callback?: ()=>void): Promise<void> {
    return new Promise((resolve, reject) => {
      this.expressApp.listen(port, () => {
        console.log(`Server running on port ${port}`);
        this.listRoutes();
        resolve();
        if(callback) callback();
      });

      // on error
      this.expressApp.on("error", (err) => {
        console.error(err);
        reject(err);
      });
    });
  }

  /**
   * List all the routes registered in the express app
   * @returns {void}
   * */
  private listRoutes(): void {
    const routes = listEndpoints(this.expressApp as any);
    console.table(
      routes.map((e) => ({
        methods: e.methods.toString(),
        path: e.path,
      }))
    );
  }
}
