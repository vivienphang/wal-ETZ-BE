import express, { Router } from "express";
import BaseRoutes from "./baseRoutes";

const router: Router = express.Router();

export default class AccountsRoutes extends BaseRoutes {
  routes() {
    /* no auth routes */
    router.post(
      "/newTest",
      this.controller.createNewAccount.bind(this.controller)
    );

    /* auth routes */
    router.use(this.JWTMiddleware);
    router.post(
      "/initializeAccount",
      this.controller.createInitialAccount.bind(this.controller)
    );
    router.post(
      "/newAccount",
      this.controller.createNewAccount.bind(this.controller)
    );
    return router;
  }
}
