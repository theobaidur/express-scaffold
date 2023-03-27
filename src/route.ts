import express from "express";
import { Schema } from "express-validator";
import "reflect-metadata";
import ControllerResponse from "./controller-response";
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

type ControllerMethod = (
  request: express.Request
) => Promise<ControllerResponse>;

type ControllerMethodDecorator = (
  target: any,
  propertyKey: any,
  descriptor: TypedPropertyDescriptor<ControllerMethod>
) => TypedPropertyDescriptor<ControllerMethod> | void;

export type RouteConfig = {
  path: string;
  method: Method;
  handlers: express.RequestHandler[];
  key: string;
  schema?: Schema;
};

function Controller(path?: string) {
  return function (target: any) {
    // class name
    const className = target.name;

    path = path ?? className ?? "";
    Reflect.defineMetadata(BASE_PATH, path, target);
  };
}

function RouteDecoratorFactory(method: Method) {
  return function (
    path?: string,
    schema?: Schema,
    handlers: express.RequestHandler[] = []
  ): ControllerMethodDecorator {
    return function (target: any, key: string) {
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
    };
  };
}

const Get = RouteDecoratorFactory("get");
const Post = RouteDecoratorFactory("post");
const Put = RouteDecoratorFactory("put");
const Delete = RouteDecoratorFactory("delete");
const Patch = RouteDecoratorFactory("patch");
const All = RouteDecoratorFactory("all");
const Route = Get;

export { Get, Post, Put, Delete, Patch, All, Route, Controller };
