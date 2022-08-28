/* eslint-disable class-methods-use-this */
import { Request, Response } from "express";
import passport from "passport";
import BaseController from "./baseController";

export default class AuthController extends BaseController {
  async loginFailed(_req: Request, res: Response) {
    console.log("running login failed");
    res.status(401).json({
      success: false,
      onmessage: "failure",
    });
  }

  // async googleAuth(_req: Request, res: Response) {
  //   console.log("running google auth");
  //   res.send(passport.authenticate("google", { scope: ["profile", "email"] }));
  // }

  async googleAuthSuccess(_req: Request, res: Response) {
    console.log("succesfully authorized");
    res.redirect(process.env.FRONTEND_URL as string);
  }
}
