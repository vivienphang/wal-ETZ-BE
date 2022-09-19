import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import BaseController from "./baseController";
import responseStatus from "../controller/responseStatus";
import { payloadInterface } from "../types/jwtPayload";
import { customReq } from "../types/extendedExpressInterface";

const { SESSION_ERROR, OAUTH_LOGGED_IN, OAUTH_LOGGED_IN_FAIL } = responseStatus;

require("dotenv").config();

const { FRONTEND_URL } = process.env;

export default class AuthController extends BaseController {
  loginFailed(_req: Request, res: Response) {
    res.status(401).json({
      success: false,
      onmessage: "failure",
    });
  }

  googleAuthSuccess(req: customReq, res: Response) {
    // successful authentication, redirect to home
    res.cookie("id", req.user!._id);
    res.redirect(`${FRONTEND_URL}/oauthLoader`);
  }

  // extracting request.user details
  requestUser(req: Request, res: Response) {
    return res.send(req.user);
  }

  // delete the user session
  logoutUser(req: Request, res: Response) {
    if (req.session) {
      req.session.regenerate((error) => {
        if (error) {
          return res.status(400).json({ status: SESSION_ERROR });
        }
        return null;
      });
      req.logout((error) => {
        if (error) {
          return res.status(400).json({ status: SESSION_ERROR });
        }
        return null;
      });
      req.session.destroy(() => {
        // console.log("error:", error);
      });
      return res.redirect(`${FRONTEND_URL}`);
    }
    return res.redirect(`${FRONTEND_URL}`);
  }

  oauthLoader(req: Request, res: Response) {
    if (req.cookies.id) {
      const payload: payloadInterface = {
        id: req.cookies.id,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXP,
      });
      res.status(200).json({ status: OAUTH_LOGGED_IN, token });
      return;
    }
    res.status(400).json({ status: OAUTH_LOGGED_IN_FAIL });
  }
}
