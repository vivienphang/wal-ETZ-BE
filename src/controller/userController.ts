import axios from "axios";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import aws from "aws-sdk";
import fs from "fs";
import { Model } from "mongoose";
import {
  RedisClientType,
  RedisFunctions,
  RedisModules,
  RedisScripts,
} from "redis";

import BaseController from "./baseController";
import responseStatus from "./responseStatus";
import { JWTMiddlewareRequest, JWTRequest } from "../types/jwtRequestInterface";
import { payloadInterface } from "../types/jwtPayload";
import { UsersAttributes } from "../types/userInterface";
import currencyList from "../constants/currencyList";

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
  REDIS_ERROR,
  UPDATE_PROFILE_FAILED,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PICTURE_FAILED,
  UPDATE_PICTURE_SUCCESS,
} = responseStatus;

export default class UserController extends BaseController {
  public redis: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;

  constructor(
    model: Model<UsersAttributes>,
    redis: RedisClientType<RedisModules, RedisFunctions, RedisScripts>
  ) {
    super(model);
    this.redis = redis;
  }

  async init() {
    await this.redis.connect();
  }

  /* non jwt routes */
  async signUp(req: Request, res: Response) {
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
    let exchangeRate: any = {};
    const fromCurrency = populatedUserData.defaultCurrency;
    if (populatedUserData.defaultCurrency) {
      try {
        exchangeRate = await this.redis.hGetAll(fromCurrency);
        if (!Object.keys(exchangeRate).length) {
          const nextUTCHalfPastMidnight = new Date(
            new Date().setUTCHours(24, 30, 0, 0)
          );
          const currencyListString: string = currencyList.join();
          const getRates = await axios.get(
            `${process.env.EXCHANGE_RATE_API}?base=${fromCurrency}&symbols=${currencyListString}`
          );
          Object.keys(getRates.data.rates).forEach((key) => {
            this.redis.hSet(fromCurrency, key, getRates.data.rates[key]);
          });
          this.redis.expireAt(fromCurrency, nextUTCHalfPastMidnight);
          exchangeRate = await this.redis.hGetAll(fromCurrency);
        }
      } catch (err) {
        return res.status(400).json({ status: REDIS_ERROR });
      }
    }
    return res.status(200).json({
      status: POPULATE_SUCCESS,
      data: { user: populatedUserData, exchangeRate },
    });
  }

  // update username only
  async updateUsernameOnly(req: Request, res: Response) {
    const { id, username } = req.body;
    let updateUsernameOnly: UsersAttributes | null;
    try {
      updateUsernameOnly = await this.model
        .findByIdAndUpdate(id, { username }, { returnDocument: "after" })
        .select("-password -createdAt -updatedAt -__v -accounts");
      if (!username) {
        throw new Error("Username cannot be empty!");
      }
    } catch (err) {
      return res.status(400).json({ status: UPDATE_PROFILE_FAILED });
    }
    return res.status(200).json({
      status: UPDATE_PROFILE_SUCCESS,
      data: { updateUsernameOnly },
    });
  }

  // update currency only
  async updateCurrencyOnly(req: Request, res: Response) {
    const { id, defaultCurrency } = req.body;
    let updateCurrencyOnly: UsersAttributes | null;
    try {
      updateCurrencyOnly = await this.model
        .findByIdAndUpdate(
          id,
          {
            defaultCurrency,
          },
          { returnDocument: "after" }
        )
        .select("-password -createdAt -updatedAt -__v -accounts");
    } catch (err) {
      return res.status(400).json({ status: UPDATE_PROFILE_FAILED });
    }
    let exchangeRate: any = {};
    try {
      exchangeRate = await this.redis.hGetAll(defaultCurrency);
      if (!Object.keys(exchangeRate).length) {
        const nextUTCHalfPastMidnight = new Date(
          new Date().setUTCHours(24, 30, 0, 0)
        );
        const currencyListString: string = currencyList.join();
        const getRates = await axios.get(
          `${process.env.EXCHANGE_RATE_API}?base=${defaultCurrency}&symbols=${currencyListString}`
        );
        Object.keys(getRates.data.rates).forEach((key) => {
          this.redis.hSet(defaultCurrency, key, getRates.data.rates[key]);
        });
        this.redis.expireAt(defaultCurrency, nextUTCHalfPastMidnight);
        exchangeRate = await this.redis.hGetAll(defaultCurrency);
      }
    } catch (err) {
      return res.status(400).json({ status: REDIS_ERROR });
    }

    return res.status(200).json({
      status: UPDATE_PROFILE_SUCCESS,
      data: { updateCurrencyOnly, exchangeRate },
    });
  }

  // update username and currency
  async updateProfile(req: Request, res: Response) {
    const { id, username, currency } = req.body;
    let updateProfile: UsersAttributes | null;
    try {
      updateProfile = await this.model
        .findByIdAndUpdate(
          id,
          { username, defaultCurrency: currency },
          { returnDocument: "after" }
        )
        .select("-password -createdAt -updatedAt -__v -accounts");
      if (!updateProfile) {
        throw new Error("no user exist");
      }
    } catch (err) {
      return res.status(400).json({ status: UPDATE_PROFILE_FAILED });
    }
    let exchangeRate: any = {};
    try {
      exchangeRate = await this.redis.hGetAll(currency);
      if (!Object.keys(exchangeRate).length) {
        const nextUTCHalfPastMidnight = new Date(
          new Date().setUTCHours(24, 30, 0, 0)
        );
        const currencyListString: string = currencyList.join();
        const getRates = await axios.get(
          `${process.env.EXCHANGE_RATE_API}?base=${currency}&symbols=${currencyListString}`
        );
        Object.keys(getRates.data.rates).forEach((key) => {
          this.redis.hSet(currency, key, getRates.data.rates[key]);
        });
        this.redis.expireAt(currency, nextUTCHalfPastMidnight);
        exchangeRate = await this.redis.hGetAll(currency);
      }
    } catch (err) {
      return res.status(400).json({ status: REDIS_ERROR });
    }

    return res.status(200).json({
      status: UPDATE_PROFILE_SUCCESS,
      data: { user: updateProfile, exchangeRate },
    });
  }

  async updatePicture(req: Request, res: Response) {
    const { id } = req.body;
    // Connecting to S3 bucket
    const s3 = new aws.S3({
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      region: process.env.S3_BUCKET_REGION,
    });
    try {
      if (req.file === null) {
        return res.status(400).json({ message: "Please choose another file." });
      }
      const { file } = req;
      const fileStream: any = fs.readFileSync(file!.path);

      const uploadedImage = await s3
        .upload({
          Bucket: String(process.env.BUCKET_NAME),
          Key: file!.originalname,
          Body: fileStream,
        })
        .promise();
      const updateUserPicture = await this.model
        .findByIdAndUpdate(
          id,
          { profilePicture: uploadedImage.Location },
          { returnDocument: "after" }
        )
        .select("-password -createdAt -updatedAt -__v -accounts");
      return res
        .status(200)
        .json({ status: UPDATE_PICTURE_SUCCESS, data: updateUserPicture });
    } catch (err) {
      return res.status(400).json({ status: UPDATE_PICTURE_FAILED });
    }
  }
}
