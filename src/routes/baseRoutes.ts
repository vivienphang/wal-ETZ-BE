import { RequestHandler } from "express";
import UserController from "../controller/userController";

export default class BaseRoutes {
  public controller: UserController;

  public JWTMiddleware: RequestHandler;

  constructor(controller: UserController, JWTMiddleware: RequestHandler) {
    this.controller = controller;
    this.JWTMiddleware = JWTMiddleware;
  }
}
