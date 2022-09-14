import express, { Router } from "express";
import BaseRoutes from "./baseRoutes";

const router: Router = express.Router();

export default class UsersRoutes extends BaseRoutes {
  routes() {
    router.get("/testRedis", this.controller.testRedis.bind(this.controller));
    router.get(
      "/testGetExchange",
      this.controller.testGetExchange.bind(this.controller)
    );

    /* no auth routes */
    router.post("/signup", this.controller.signUp.bind(this.controller));
    router.post("/login", this.controller.logIn.bind(this.controller));

    /* auth routes */
    router.use(this.JWTMiddleware);

    router.post("/refresh", this.controller.JWTRefresh.bind(this.controller));
    router.get(
      "/populateAccounts",
      this.controller.populateAccounts.bind(this.controller)
    );

    router.get(
      "/populateRecords",
      this.controller.populateRecords.bind(this.controller)
    );
    return router;
  }
}
