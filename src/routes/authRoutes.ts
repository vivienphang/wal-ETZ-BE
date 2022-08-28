import { NextFunction } from "connect";
import express, { Request, Response, Router } from "express";
import passport from "passport";
import BaseRoutes from "./baseRoutes";

const router: Router = express.Router();

export default class AuthRoutes extends BaseRoutes {
  routes() {
    // router.get("/failed", this.controller.loginFailed.bind(this.controller));
    // this.controller.googleAuth.bind(this.controller));

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
        successRedirect: `${process.env.FRONTEND_URL}/`,
        failureRedirect: `${process.env.FRONTEND_URL}/login`,
      })
    );

    // router.post("/logout", (req: Request, res: Response, next: NextFunction) => {
    //   req.logout((err) => {
    //     if (err) {
    //       return next(err);
    //     }
    //     res.redirect("/");
    //   });
    // });

    return router;
  }
}
