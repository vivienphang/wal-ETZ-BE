import { RequestHandler } from "express";
import AccountsController from "../controller/accountsController";
import AuthController from "../controller/authController";
import UserController from "../controller/userController";
import RecordsController from "../controller/recordsController";

export default class BaseRoutes {
  public controller: any;

  public JWTMiddleware: RequestHandler;

  constructor(
    controller:
      | UserController
      | AccountsController
      | AuthController
      | RecordsController,
    JWTMiddleware: RequestHandler
  ) {
    this.controller = controller;
    this.JWTMiddleware = JWTMiddleware;
  }
}
