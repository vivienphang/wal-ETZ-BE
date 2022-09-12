/* eslint-disable max-len */
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import aws from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";
import BaseController from "./baseController";
import responseStatus from "./responseStatus";
import { JWTMiddlewareRequest, JWTRequest } from "../types/jwtRequestInterface";
import { payloadInterface } from "../types/jwtPayload";
import { UsersAttributes } from "../types/userInterface";
import { userModel } from "../model/model";

const {
  CREATED_USER,
  CREATE_USER_FAILED,
  JWT_REFRESHED,
  JWT_NO_USER,
  LOGGED_IN,
  USER_NOT_FOUND,
  PASSWORD_MISMATCH,
  POPULATE_FAIL,
  POPULATE_SUCCESS,
  UPDATE_PROFILE_FAILED,
  UPDATE_PROFILE_SUCCESS,
} = responseStatus;

// Connect to S3 bucket
const s3 = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS,
  region: process.env.S3_BUCKET_REGION,
});

const upload = (bucketName: string) =>
  multer({
    storage: multerS3({
      s3,
      bucket: bucketName, // "bucket-for-capstone",
      metadata(
        req: any,
        file: { fieldName: any },
        // eslint-disable-next-line no-unused-vars
        cb: (arg0: null, arg1: { fieldName: any }) => void
      ) {
        cb(null, { fieldName: file.fieldName });
      },
      key(req, file, cb) {
        cb(null, "image.jpeg"); // accepts 2 params, null and file name as image.jpeg
      },
    }),
  });
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

    const payload: payloadInterface = {
      id: String(newUser.id),
    };

    const token: string = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXP,
    });
    return res.status(200).json({ status: CREATED_USER, token });
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
      if (!checkUser) {
        throw new Error("No user");
      }
    } catch (err) {
      return res.status(400).json({ status: USER_NOT_FOUND });
    }

    const dbPassword: string = checkUser?.password as string;
    const passwordCheck: boolean = await bcrypt.compare(password, dbPassword);
    if (passwordCheck) {
      const payload: payloadInterface = {
        id: String(checkUser?.id),
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXP,
      });
      return res.status(200).json({ status: LOGGED_IN, token });
    }
    return res.status(400).json({ status: PASSWORD_MISMATCH });
  }

  // extracting request.user details
  async getUserDetails(req: JWTRequest, res: Response) {
    console.log("running get user details");
    console.log(this.model);
    if (req.user) {
      const payload: payloadInterface = {
        id: req.user.id,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXP,
      });
      return res.status(200).json({ status: JWT_REFRESHED, token });
    }
    return res.status(400).json({ status: JWT_NO_USER });
  }

  /* jwt routes */
  JWTRefresh(req: JWTMiddlewareRequest, res: Response) {
    console.log("checking if jwt is present");
    console.log(this.model);
    const { id } = req.body;
    const payload: payloadInterface = {
      id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXP,
    });
    res.status(200).json({ status: JWT_REFRESHED, token });
  }

  async populateAccounts(req: JWTMiddlewareRequest, res: Response) {
    console.log("populating accounts");
    const { id } = req.body;
    let populatedUserData: any;
    try {
      populatedUserData = await this.model
        .findById(id)
        .populate({ path: "accounts" });
      if (!populatedUserData) {
        throw new Error("no user exist");
      }
    } catch (err) {
      return res.status(400).json({ status: POPULATE_FAIL });
    }
    return res
      .status(200)
      .json({ status: POPULATE_SUCCESS, data: populatedUserData });
  }

  async populateRecords(req: JWTMiddlewareRequest, res: Response) {
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
            options: { sort: "-recordDate" },
          },
          select: "-createdAt -updatedAt -__v",
        })
        .select("-password -createdAt -updatedAt -__v");
      if (!populatedUserData) {
        throw new Error("no user exist");
      }
    } catch (err) {
      return res.status(400).json({ status: POPULATE_FAIL });
    }
    return res
      .status(200)
      .json({ status: POPULATE_SUCCESS, data: populatedUserData });
  }

  async updateProfile(req: Request, res: Response) {
    console.log("updating user details");
    const { id, username, currency } = req.body;
    console.log("from REQ,BODY:", req.body);
    console.log("username:", username, "currency:", currency, id);
    let updateProfile: UsersAttributes | null;
    try {
      updateProfile = await this.model
        .findByIdAndUpdate(
          id,
          { username, defaultCurrency: currency },
          { returnDocument: "after" }
        )
        .select("-password -createdAt -updatedAt -__v -accounts");
      console.log(updateProfile);
      if (!updateProfile) {
        throw new Error("no user exist");
      }
    } catch (err) {
      return res.status(400).json({ status: UPDATE_PROFILE_FAILED });
    }
    return res
      .status(200)
      .json({ status: UPDATE_PROFILE_SUCCESS, data: updateProfile });
  }

  async updatePicture(req: Request, res: Response) {
    const uploadSingle = upload("bucket-for-capstone").single("image-upload");

    uploadSingle(res, req, async (err: { message: any }) => {
      if (err) return res.status(400).json({ success: false, err });
      await userModel.create({ profilePicture: req.file.location });
      console.log(req.file);
      return res.status(200).json({ data: req.file });
    });
  }
}
