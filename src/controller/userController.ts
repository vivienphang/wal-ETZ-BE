import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import BaseController from "./baseController";
import responseStatus from "./responseStatus";
import { JWTRequest } from "../types/jwtRequestInterface";
import { JwtPayload } from "../types/jwtPayload";

const {
  CREATED_USER,
  CREATED_USER_FAILED,
  JWT_REFRESHED,
  LOGGED_IN,
  USER_NOT_FOUND,
  PASSWORD_MISMATCH,
} = responseStatus;

export default class UserController extends BaseController {
  /* non jwt routes */
  async signUp(req: Request, res: Response) {
    console.log("signing up new user");
    const { username, email, password } = req.body;
    const hashedPassword: string = await bcrypt.hash(
      password,
      Number(process.env.SALT_ROUNDS)
    );
    let newUser: any;
    try {
      newUser = await this.model.create({
        username,
        email,
        password: hashedPassword,
      });
    } catch (err) {
      return res.status(400).json({ status: CREATED_USER_FAILED });
    }

    const payload: JwtPayload = {
      id: newUser.id,
    };
    console.log("payload: ", payload);
    const token: string = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXP,
    });
    return res
      .status(200)
      .json({ status: CREATED_USER, id: newUser.id, token });
  }

  async logIn(req: Request, res: Response) {
    console.log("logging in user");
    const { loginCredentials, password } = req.body;
    let checkUser: any;
    try {
      checkUser = await this.model.findOne({ email: loginCredentials });
      if (!checkUser) {
        checkUser = await this.model.findOne({ username: loginCredentials });
      }
    } catch (err) {
      return res.status(400).json({ status: USER_NOT_FOUND });
    }

    const dbPassword: string = checkUser.password as string;
    const passwordCheck: boolean = await bcrypt.compare(password, dbPassword);
    if (passwordCheck) {
      const payload: JwtPayload = {
        id: checkUser.id,
      };
      console.log("payload: ", payload);
      const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXP,
      });
      return res
        .status(200)
        .json({ status: LOGGED_IN, id: checkUser.id, token });
    }
    return res.status(400).json({ status: PASSWORD_MISMATCH });
  }

  /* jwt routes */
  JWTRefresh(req: JWTRequest, res: Response) {
    console.log("checking if jwt is present");
    console.log(this.model);
    const { id } = req.body;
    const payload: JwtPayload = {
      id,
    };
    console.log("payload: ", payload);
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXP,
    });
    res.status(200).json({ message: JWT_REFRESHED, id, token });
  }
}
