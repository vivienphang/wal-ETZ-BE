/* eslint-disable no-unused-expressions */
/* eslint-disable class-methods-use-this */
import { Request, Response } from "express";
// import passport from "passport";
import BaseController from "./baseController";

export default class AuthController extends BaseController {
  // async loginFailed(_req: Request, res: Response) {
  //   // if
  //   console.log("running login failed");
  //   res.status(401).json({
  //     success: false,
  //     onmessage: "failure",
  //   });
  // }
  // async googleAuth(_req: Request, res: Response) {
  //   console.log("running google auth");
  //   console
  //     .log
  //     // passport.authenticate("google", { scope: ["profile", "email"] })
  //     ();
  // }
  // async googleAuthSuccess(_req: Request, _res: Response) {
  //   console.log("running google callback successful");
  //   passport.authenticate("google", {
  //     // successRedirect: process.env.FRONTEND_URL,
  //     failureRedirect: "/" | undefined,
  //   }),
  //     (_req: Request, res: Response) => {
  //       console.log("google callback: successful response");
  //       // successful authentication, redirect to home
  //       res.redirect("/");
  //     };
  // }
  // async googleLogout(req: Request) {}
}
