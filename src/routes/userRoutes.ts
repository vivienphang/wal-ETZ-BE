import express, { Router } from "express";
import BaseRoutes from "./baseRoutes";

const router: Router = express.Router();

export default class UsersRoutes extends BaseRoutes {
  routes() {
    /* no auth routes */
    router.post("/signup", this.controller.signUp.bind(this.controller));
    router.post("/login", this.controller.logIn.bind(this.controller));
    /* auth routes */
    router.use(this.JWTMiddleware);
    router.post("/refresh", this.controller.JWTRefresh.bind(this.controller));
    return router;
  }
}
