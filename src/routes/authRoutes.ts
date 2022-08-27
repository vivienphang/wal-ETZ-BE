import express, { Request, Response, Router } from "express";
import passport from "passport";
import BaseRoutes from "./baseRoutes";

const router: Router = express.Router();

export default class AuthRoutes extends BaseRoutes {
  // eslint-disable-next-line class-methods-use-this
  routes() {
    // outh failed
    router.get("/failed", this.controller.loginFailed.bind(this.controller));
    // (req: Request, res: Response) => {
    //   res.status(401).json({
    //     success: false,
    //     onmessage: "failure",
    //   });
    // });
    router.get(
      "/google",

      //   this.controller.googleAuth.bind(this.controller)
      // );

      passport.authenticate("google", { scope: ["profile", "email"] })
    );
    router.get(
      "/google/callback",
      passport.authenticate("google", {
        // successRedirect: process.env.FRONTEND_URL,
        failureRedirect: `${process.env.FRONTEND_URL}/login`,
      }),
      // eslint-disable-next-line prefer-arrow-callback,
      (req: Request, res: Response) => {
        // successful authentication, redirect to home
        res.redirect(process.env.FRONTEND_URL as string);
      }
    );

    router.post("/logout", (req: Request, res: Response, next: Next) => {
      req.logout((err) => {
        if (err) {
          return next(err);
        }
        res.redirect("/");
      });
    });

    return router;
  }
}
