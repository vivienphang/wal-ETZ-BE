/* eslint-disable no-sequences */
/* eslint-disable no-unused-expressions */
/* eslint-disable class-methods-use-this */
import { Request, Response } from "express";
import passport from "passport";
import session from "express-session";
import BaseController from "./baseController";
import { userModel } from "../model/model";
import { NextFunction } from "express-serve-static-core";

require("dotenv").config();

const { FRONTEND_URL } = process.env;

export default class AuthController extends BaseController {
  async loginFailed(_req: Request, res: Response) {
    console.log("running login failed");
    res.status(401).json({
      success: false,
      onmessage: "failure",
    });
  }

  async googleAuthSuccess(req: Request, res: Response) {
    console.log("google callback: successful response");
    // successful authentication, redirect to home
    console.log("this is REQ.USER:", req.user);
    res.redirect(`${FRONTEND_URL}/home`);
  }

  // extracting request.user details
  async requestUser(req: Request, res: Response) {
    console.log("running req.user");
    if (req.user) {
      console.log("REQ.USER HERE", req.user);
    }
    return res.send(req.user);
  }

  // delete the user session
  async logoutUser(req: Request, res: Response) {
    console.log("this is REQ.USER", req.user);
    if (req.session) {
      req.session.regenerate((error) => {
        if (error) {
          console.log(error);
          return res.status(400).send(error);
        }
        return null;
      });
      console.log("LOGGING OUT --> removing session");
      // eslint-disable-next-line consistent-return
      req.logout((error) => {
        if (error) {
          console.log(error);
          return res.status(400).send(error);
        }
      });
      req.session.destroy((error) => {
        console.log("req.session destroyed!");
        console.log("error:", error);
        return res.status(400).send(error);
      });
      return res.redirect(`${FRONTEND_URL}`);
    }
    return res.redirect(`${FRONTEND_URL}`);
  }
}
