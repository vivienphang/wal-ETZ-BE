import express, { Router } from "express";
import passport from "passport";
import BaseRoutes from "./baseRoutes";

const router: Router = express.Router();

export default class AuthRoutes extends BaseRoutes {
  routes() {
    // router.get("/failed", this.controller.loginFailed.bind(this.controller));

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
        // successRedirect: `${process.env.FRONTEND_URL}`,
        failureRedirect: `${process.env.FRONTEND_URL}`,
      }),
      this.controller.googleAuthSuccess.bind(this.controller)
    );

    router.get("/oauth", this.controller.oauthLoader.bind(this.controller));

    // router.get("/logout", this.controller.requestUser.bind(this.controller));
    router.get("/logout", this.controller.logoutUser.bind(this.controller));
    // (req: Request, res: Response, next: NextFunction) => {
    //   req.logout((err) => {
    //     if (err) {
    //       return next(err);
    //     }
    //     res.redirect("/");
    //   });
    // }
    // );

    return router;
  }
}
