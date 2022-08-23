import { RequestHandler } from "express";
import AccountsController from "../controller/accountsController";
import UserController from "../controller/userController";

export default class BaseRoutes {
  // dunno why this dont work
  // public controller: UserController | AccountsController;
  public controller: any;

  public JWTMiddleware: RequestHandler;

  constructor(
    controller: UserController | AccountsController,
    JWTMiddleware: RequestHandler
  ) {
    this.controller = controller;
    this.JWTMiddleware = JWTMiddleware;
  }
}
