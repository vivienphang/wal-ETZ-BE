import express, { Request, Response, Router } from "express";
import passport from "passport";
import BaseRoutes from "./baseRoutes";

const router: Router = express.Router();

export default class AuthRoutes extends BaseRoutes {
  routes() {
    router.get("/failed", this.controller.loginFailed.bind(this.controller));

    router.get("/google", this.controller.googleAuth.bind(this.controller));

    // google authentication
    router.use(
      passport.authenticate("google", {
        failureRedirect: `${process.env.FRONTEND_URL}/login`,
      })
    );
    router.get("/google/callback", (req: Request, res: Response) => {
      res.redirect(process.env.FRONTEND_URL as string);
    });

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
