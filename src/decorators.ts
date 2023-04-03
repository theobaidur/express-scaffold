import express from "express";
import { Schema } from "express-validator";
import "reflect-metadata";
import ControllerResponse from "./controller-response";
import { ExpressController } from "./express-controller";
export const BASE_PATH = "base_path";
export const ROUTES = "routes";

type Method =
  | "all"
  | "get"
  | "post"
  | "put"
  | "delete"
  | "patch"
  | "options"
  | "head";

export type ControllerMethod = (
  request: express.Request,
  response: express.Response
) => Promise<ControllerResponse>;


export type RouteConfig = {
  path: string;
  method: Method;
  handlers: express.RequestHandler[];
  key: string;
  schema?: Schema;
};

/**
 * Class Decorator for Controllers
 * The target class must extend ExpressController
 * @param path {string} - Path of the controller, if not provided, the name of the class will be used
 * @returns 
 */
function Controller(path?: string) {
  return function<T extends new(...args: any[]) => ExpressController>(constructor: T) {
    if (path === undefined) {
      path = constructor.name;
    }
    if (!path.startsWith("/")) {
      path = `/${path}`;
    }
    Reflect.defineMetadata(BASE_PATH, path, constructor);
    return constructor;
  };
}

type DescriptorType = TypedPropertyDescriptor<(req?: express.Request, res?: express.Response)=>Promise<ControllerResponse>>;

/**
 * Factory for Route Decorators
 * @param method {Method} - HTTP Method
 * @returns {Function}
 * @constructor
 * */
function RouteFactory(method: Method): Function {
  return function (
    path?: string,
    schema?: Schema,
    handlers: express.RequestHandler[] = []
  ) {
    return function<T extends ExpressController> (target: T, key: string, descriptor: DescriptorType): DescriptorType {
      const controller = target.constructor;
      const routes = Reflect.getMetadata(ROUTES, controller) || [];
      if (path === undefined) {
        path = key;
      }
      path = path || key;
      if (!path.startsWith("/")) {
        path = `/${path}`;
      }
      const config: RouteConfig = {
        path,
        method,
        handlers,
        key,
        schema,
      };
      routes.push(config);
      Reflect.defineMetadata(ROUTES, routes, controller);
      return descriptor;
    };
  };
}

/**
 * Decorator for GET method, defines a GET route, within the controller
 * @param path {string} - Path of the route, if not provided, the name of the method will be used
 * @param schema {Schema} - Schema for validation, using express-validator
 * @param handlers {RequestHandler[]} - Express Request Handlers
 * @returns {MethodDecorator}
 */
const Get = RouteFactory("get");
/**
 * Decorator for POST method, defines a POST route, within the controller
 * @param path {string} - Path of the route, if not provided, the name of the method will be used
 * @param schema {Schema} - Schema for validation, using express-validator
 * @param handlers {RequestHandler[]} - Express Request Handlers
 * @returns {MethodDecorator}
 * */
const Post = RouteFactory("post");
/**
 * Decorator for PUT method, defines a PUT route, within the controller
 * @param path {string} - Path of the route, if not provided, the name of the method will be used
 * @param schema {Schema} - Schema for validation, using express-validator
 * @param handlers {RequestHandler[]} - Express Request Handlers
 * @returns {MethodDecorator}
 * */
const Put = RouteFactory("put");
/**
 * Decorator for DELETE method, defines a DELETE route, within the controller
 * @param path {string} - Path of the route, if not provided, the name of the method will be used
 * @param schema {Schema} - Schema for validation, using express-validator
 * @param handlers {RequestHandler[]} - Express Request Handlers
 * @returns {MethodDecorator}
 * */
const Delete = RouteFactory("delete");
/**
 * Decorator for PATCH method, defines a PATCH route, within the controller
 * @param path {string} - Path of the route, if not provided, the name of the method will be used
 * @param schema {Schema} - Schema for validation, using express-validator
 * @param handlers {RequestHandler[]} - Express Request Handlers
 * @returns {MethodDecorator}
 * */
const Patch = RouteFactory("patch");
/**
 * Decorator for OPTIONS method, defines a OPTIONS route, within the controller
 * @param path {string} - Path of the route, if not provided, the name of the method will be used
 * @param schema {Schema} - Schema for validation, using express-validator
 * @param handlers {RequestHandler[]} - Express Request Handlers
 * @returns {MethodDecorator}
 * */
const Options = RouteFactory("options");
/**
 * Decorator for HEAD method, defines a HEAD route, within the controller
 * @param path {string} - Path of the route, if not provided, the name of the method will be used
 * @param schema {Schema} - Schema for validation, using express-validator
 * @param handlers {RequestHandler[]} - Express Request Handlers
 * @returns {MethodDecorator}
 * */
const Head = RouteFactory("head");
/**
 * Decorator for ALL method, defines a ALL route, within the controller
 * @param path {string} - Path of the route, if not provided, the name of the method will be used
 * @param schema {Schema} - Schema for validation, using express-validator
 * @param handlers {RequestHandler[]} - Express Request Handlers
 * @returns {MethodDecorator}
 * */
const All = RouteFactory("all");

const Route = Get;

export { Get, Post, Put, Delete, Patch, All, Route, Controller, Options, Head };
