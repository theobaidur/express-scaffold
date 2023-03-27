import express from "express";
import listEndpoints from "express-list-endpoints";
import { checkSchema, validationResult } from "express-validator";
import ControllerError from "./controller-error";
import ControllerResponse from "./controller-response";
import { BASE_PATH, RouteConfig, ROUTES } from "./route";

export class ExpressApp {
  constructor(
    private expressApp: express.Application = express(),
    private host: string = "http://localhost:3000",
    private port: number = 3000
  ) {}

  registerMiddleware(...middlewareList: express.RequestHandler[]): void {
    middlewareList.forEach((middleware) => {
      this.expressApp.use(middleware);
    });
  }

  registerController(controller: any): void {
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
              throw new ControllerError(
                "Invalid request",
                400,
                errors.array().reduce((err, curr) => {
                  if (!err[curr.param]) {
                    err[curr.param] = [];
                  }
                  err[curr.param].push(curr.msg);
                  return err;
                }, {} as any)
              );
            }
          }
          let result: ControllerResponse = await instance[route.key](req, res);
          if (result.has_downloadable_data) {
            // result.data is a csv file as a string
            // should be sent as a downloadable file
            res.setHeader(
              "Content-Disposition",
              `attachment; filename=${result.file_name}`
            );
            res.setHeader("Content-Type", result.file_type);
            res.send(result.data);
          } else {
            const { code, ...other } = result.toJSON();
            res.status(code).json(other);
          }
        } catch (e) {
          if (e instanceof ControllerError) {
            const { code, ...other } = e.toJSON();
            res.status(code).json(other);
          } else {
            console.error(e);
            const { code, ...other } = ControllerResponse.withError(
              "Internal Server Error",
              500
            )().toJSON();

            res.status(code).json(other);
          }
        }
      });
    });
  }
  registerControllers(...controllers: any[]): void {
    controllers.forEach((controller) => {
      this.registerController(controller);
    });
  }

  registerRoute(
    method: RouteConfig["method"],
    path: string,
    ...handlers: RouteConfig["handlers"]
  ): void {
    this.expressApp[method](path, ...handlers);
  }

  start(printRoute?: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      const port = this.port;
      this.expressApp.listen(port, () => {
        console.log(`Server running on port ${port}`);
        if (printRoute) {
          console.log(`Available routes:`);
          this.listRoutes();
        }
        resolve();
      });

      // on error
      this.expressApp.on("error", (err) => {
        console.error(err);
        reject(err);
      });
    });
  }

  listRoutes(): void {
    const routes = listEndpoints(this.expressApp as any);
    console.table(
      routes.map((e) => ({
        methods: e.methods.join(", "),
        path: `${this.host}${e.path}`,
      }))
    );
  }
}
