import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import BaseController from "./baseController";
import responseStatus from "./responseStatus";
import { JWTRequest } from "../types/jwtRequestInterface";
import { JwtPayload } from "../types/jwtPayload";
import { UsersAttributes } from "../types/userInterface";

const {
  CREATED_USER,
  CREATE_USER_FAILED,
  JWT_REFRESHED,
  LOGGED_IN,
  USER_NOT_FOUND,
  PASSWORD_MISMATCH,
  POPULATE_FAIL,
  POPULATE_SUCCESS,
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
    let newUser: UsersAttributes;
    try {
      newUser = await this.model.create({
        username,
        email,
        password: hashedPassword,
      });
    } catch (err) {
      return res.status(400).json({ status: CREATE_USER_FAILED });
    }

    const payload: JwtPayload = {
      id: String(newUser.id),
    };

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
    let checkUser: UsersAttributes | null;
    try {
      checkUser = await this.model.findOne({ email: loginCredentials });
      if (!checkUser) {
        checkUser = await this.model.findOne({ username: loginCredentials });
      }
    } catch (err) {
      return res.status(400).json({ status: USER_NOT_FOUND });
    }

    const dbPassword: string = checkUser?.password as string;
    const passwordCheck: boolean = await bcrypt.compare(password, dbPassword);
    if (passwordCheck) {
      const payload: JwtPayload = {
        id: String(checkUser?.id),
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXP,
      });
      return res
        .status(200)
        .json({ status: LOGGED_IN, id: String(checkUser?.id), token });
    }
    return res.status(400).json({ status: PASSWORD_MISMATCH });
  }

  async populateAccounts(req: Request, res: Response) {
    const { id } = req.body;
    console.log("populating accounts");
    let populatedUserData: any;
    // take what data i need for frontend and only pass that
    try {
      populatedUserData = await this.model
        .findById(id)
        .populate({ path: "accounts" });
    } catch (err) {
      return res.status(400).json({ status: POPULATE_FAIL });
    }
    return res
      .status(200)
      .json({ status: POPULATE_SUCCESS, data: populatedUserData });
  }

  async populateRecords(req: Request, res: Response) {
    console.log("populating accounts and records");
    const { id } = req.body;
    let populatedUserData: any;
    try {
      populatedUserData = await this.model
        .findById(id)
        .populate({
          path: "accounts",
          populate: {
            path: "accRecords",
            select: "-createdAt -updatedAt -__v",
          },
          select: "-createdAt -updatedAt -__v",
        })
        .select("-password -createdAt -updatedAt -__v");
    } catch (err) {
      return res.status(400).json({ status: POPULATE_FAIL });
    }
    return res
      .status(200)
      .json({ status: POPULATE_SUCCESS, data: populatedUserData });
  }

  /* jwt routes */
  JWTRefresh(req: JWTRequest, res: Response) {
    console.log("checking if jwt is present");
    console.log(this.model);
    const { id } = req.body;
    const payload: JwtPayload = {
      id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXP,
    });
    res.status(200).json({ message: JWT_REFRESHED, id, token });
  }
}
