import express, { Router } from "express";
import passport from "passport";
import BaseRoutes from "./baseRoutes";

const router: Router = express.Router();

export default class AuthRoutes extends BaseRoutes {
  routes() {
    router.get(
      "/google",
      passport.authenticate("google", {
        scope: ["profile", "email"],
      })
    );

    // google authentication
    router.get(
      "/google/callback",
      passport.authenticate("google", {
        failureRedirect: `${process.env.FRONTEND_URL}`,
      }),
      this.controller.googleAuthSuccess.bind(this.controller)
    );

    router.get("/oauth", this.controller.oauthLoader.bind(this.controller));
    router.get("/logout", this.controller.logoutUser.bind(this.controller));

    return router;
  }
}
