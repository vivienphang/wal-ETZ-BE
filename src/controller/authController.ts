/* eslint-disable class-methods-use-this */
import { Request, Response } from "express";
import passport from "passport";
import mongoose from "mongoose";
import BaseController from "./baseController";

export default class AuthController extends BaseController {
  async loginFailed(_req: Request, res: Response) {
    // if
    console.log("running login failed");
    res.status(401).json({
      success: false,
      onmessage: "failure",
    });
  }

  async googleAuth(_req: Request, res: Response) {
    console.log("running google auth");
    res.send(passport.authenticate("google", { scope: ["profile"] }));
  }

  async googleAuthSuccess(_req: Request, _res: Response) {
    console.log("running google callback successful");
    passport.authenticate("google", {
      // successRedirect: process.env.FRONTEND_URL,
      failureRedirect: "/" | undefined,
    }),
      (_req: Request, res: Response) => {
        console.log("google callback: successful response");
        // successful authentication, redirect to home
        res.redirect("/");
      };
  }

  async googleLogout(req: Request) {
    app.post("/logout", function (req, res) {
      req.logout(function (err) {
        if (err) {
          return next(err);
        }
        res.redirect("/");
      });
    });
  }
}
