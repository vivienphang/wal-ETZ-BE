import { config } from "dotenv";
import express, { Request, Response, Router } from "express";
import passport from "passport";
import BaseRoutes from "./baseRoutes";

const router: Router = express.Router();

require("dotenv")(config);

export default class AuthRoutes extends BaseRoutes {
  // eslint-disable-next-line class-methods-use-this
  routes() {
    // testing OAuth
    router.get("login/failed", (req: Request, res: Response) => {
      res.status(401).json({
        success: false,
        onmessage: "failure",
      });
    });
    router.get(
      "/auth/google",
      passport.authenticate("google", { scope: ["profile"] })
    );
    router.get(
      "/auth/google/callback",
      passport.authenticate("google", {
        // successRedirect: process.env.FRONTEND_URL,
        failureRedirect: "/",
      }),
      // eslint-disable-next-line prefer-arrow-callback,
      (req: Request, res: Response) => {
        // successful authentication, redirect to home
        res.redirect("/dashboard");
      }
    );

    return router;
  }
}
