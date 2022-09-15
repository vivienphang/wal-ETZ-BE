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

  async testRedis(_req: Request, res: Response) {
    this.redis.set("foo", "bar", { EX: 10 });
    const standardKeyValue = await this.redis.get("foo");
    this.redis.hSet("outerKey", "innerKey-one", "value-one");
    this.redis.hSet("outerKey", "innerKey-one", "overwrite-value-one");
    this.redis.hSet("outerKey", "innerKey-two", "value-two");
    this.redis.hSet("outerKey", "innerKey-number", 1234);
    this.redis.expire("outerKey", 100);
    const standardHashValue = await this.redis.hGetAll("outerKey");
    res.send({ standardKeyValue, standardHashValue });
  }

  async testGetExchange(_req: Request, res: Response) {
    const fromCurrency = "TWD";
    let cache = await this.redis.hGetAll(fromCurrency);
    if (!Object.keys(cache).length) {
      console.log("cache miss");
      const currencyListString: string = currencyList.join();
      const getRates = await axios.get(
        `${process.env.EXCHANGE_RATE_API}?base=${fromCurrency}&symbols=${currencyListString}`
      );
      Object.keys(getRates.data.rates).forEach((key) => {
        this.redis.hSet(fromCurrency, key, getRates.data.rates[key]);
      });
      this.redis.expireAt(
        fromCurrency,
        new Date(new Date().setUTCHours(24, 30, 0, 0))
      );
      cache = await this.redis.hGetAll(fromCurrency);
    } else {
      console.log("cache hit");
    }
    res.send(cache);
  }

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
      console.log(populatedUserData);
      if (!populatedUserData) {
        throw new Error("no user exist");
      }
    } catch (err) {
      return res.status(400).json({ status: POPULATE_FAIL });
    }
    let exchangeRate: any = {};
    const fromCurrency = populatedUserData.defaultCurrency;
    console.log(typeof fromCurrency);
    if (populatedUserData.defaultCurrency) {
      exchangeRate = await this.redis.hGetAll(fromCurrency);
      console.log(exchangeRate);
      if (!Object.keys(exchangeRate).length) {
        console.log("cache miss");
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
      } else {
        console.log("cache hit");
      }
    }
    return res.status(200).json({
      status: POPULATE_SUCCESS,
      data: { user: populatedUserData, exchangeRate },
    });
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
    const { id } = req.body;
    console.log("THIS IS req.body:", req.body);
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
      const fileStream: any = fs.readFileSync(file.path);
      console.log("this is file.path:", file.path);
      console.log("this is req.file", req.file);
      console.log("this is req.file.originalname", req.file?.originalname);

      const uploadedImage = await s3
        .upload({
          Bucket: process.env.BUCKET_NAME,
          Key: file.originalname,
          Body: fileStream,
        })
        .promise();
      console.log("uploaded image:", uploadedImage);
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
