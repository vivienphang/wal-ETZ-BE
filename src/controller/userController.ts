import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import BaseController from "./baseController";
import responseStatus from "./responseStatus";

const {
  CREATED_USER,
  CREATED_USER_FAILED,
  USER_NOT_FOUND,
  LOGGED_IN,
  PASSWORD_MISMATCH,
} = responseStatus;

export default class UserController extends BaseController {
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

    const payload = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    };
    console.log("payload: ", payload);
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXP,
    });
    return res
      .status(200)
      .json({ status: CREATED_USER, username: newUser.username, token });
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
    const passwordCheck = await bcrypt.compare(password, dbPassword);
    if (passwordCheck) {
      const payload = {
        id: checkUser.id,
        username: checkUser.username,
        email: checkUser.email,
      };
      console.log("payload: ", payload);
      const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXP,
      });
      return res
        .status(200)
        .json({ status: LOGGED_IN, username: checkUser.username, token });
    }
    return res.status(400).json({ status: PASSWORD_MISMATCH });
  }
}
