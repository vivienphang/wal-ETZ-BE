import express, { Request, Response, Router } from "express";
import passport from "passport";
import BaseRoutes from "./baseRoutes";

const router: Router = express.Router();

const CLIENT_URL = "http://localhost:3000/";

export default class AuthRoutes extends BaseRoutes {
  routes() {
    // testing OAuth
    router.get("login/failed", (req: Request, res: Response) => {
      res.status(401).json({
        success: false,
        onmessage: "failure",
      });
    });
    router.get(
      "/google",
      passport.authenticate("google", { scope: ["profile"] })
    );
    router.get(
      "/google/callback",
      passport.authenticate("google", {
        successRedirect: CLIENT_URL,
        failureRedirect: "/login/failed",
      })
    );

    return router;
  }
}
