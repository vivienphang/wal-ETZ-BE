import { RequestHandler } from "express";
import AccountsController from "../controller/accountsController";
import AuthController from "../controller/authController";
import UserController from "../controller/userController";

export default class BaseRoutes {
  // dunno why this dont work
  // public controller: UserController | AccountsController;
  public controller: any;

  public JWTMiddleware: any;

  constructor(
    controller: UserController | AccountsController | AuthController,
    JWTMiddleware: RequestHandler
  ) {
    this.controller = controller;
    this.JWTMiddleware = JWTMiddleware;
  }
}
