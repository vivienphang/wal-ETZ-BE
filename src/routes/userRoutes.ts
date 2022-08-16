import express, { Router } from "express";
import BaseRoutes from "./baseRoutes";

const router: Router = express.Router();

export default class UsersRoutes extends BaseRoutes {
  routes() {
    /* no auth routes */
    router.post("/signup", this.controller.signUp.bind(this.controller));
    router.post("/login", this.controller.logIn.bind(this.controller));
    /* auth routes */
    /* to be done
    router.use(this.authMiddleware);
    router.get("/loginCheck", this.controller.loginCheck.bind(this.controller));
    */
  }
}
