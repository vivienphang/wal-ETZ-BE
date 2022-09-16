import { Model } from "mongoose";
import { Request, Response } from "express";
import fs from "fs";
import aws from "aws-sdk";
import { AccountsAttributes } from "../types/accountsInterface";
import { RecordsAttributes } from "../types/recordsInterface";
import BaseController from "./baseController";
import responseStatus from "./responseStatus";

const {
  CREATE_RECORD_FAILED,
  CREATE_ACCOUNT_FAILED,
  UPDATE_PICTURE_FAILED,
  UPDATE_PICTURE_SUCCESS,
} = responseStatus;

export default class RecordsController extends BaseController {
  public accounts: Model<AccountsAttributes>;

  constructor(
    model: Model<RecordsAttributes>,
    accounts: Model<AccountsAttributes>
  ) {
    super(model);
    this.accounts = accounts;
  }

  async newRecord(req: Request, res: Response) {
    console.log("Creating a new record");
    const {
      amount,
      isExpense,
      recordName,
      recordComment,
      recordCategory,
      recordPhoto,
      recordDate,
      acc,
    } = req.body;
    let newRecord: RecordsAttributes;
    let updateAccount: AccountsAttributes | null;
    // Adding the record into the records table
    try {
      newRecord = await this.model.create({
        amount: Number(amount),
        isExpense,
        recordName,
        recordCategory,
        recordDate,
        recordPhoto,
        recordComment,
      });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ status: CREATE_RECORD_FAILED });
    }
    // Add this record id into the corrosponding record
    try {
      updateAccount = await this.accounts
        .findByIdAndUpdate(
          acc,
          {
            $push: { accRecords: newRecord.id },
          },
          { returnDocument: "after" }
        )
        .populate({
          path: "accRecords",
          options: {
            sort: "-recordDate",
            select: "-createdAt -updatedAt -__v",
          },
        })
        .select("-createdAt -updatedAt -__v");
      if (updateAccount === null) {
        throw new Error("Account doesnt exist");
      }
    } catch (err) {
      console.log("Error updating account with new record:", err);
      await this.model.findByIdAndDelete(newRecord.id);
      return res.status(400).json({ status: CREATE_ACCOUNT_FAILED });
    }
    return res.status(200).json({ updateAccount });
  }

  async addReceiptS3(req: Request, res: Response) {
    // connecting to S3 bucket
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

      const uploadedImage = await s3
        .upload({
          Bucket: process.env.BUCKET_NAME,
          Key: file.originalname,
          Body: fileStream,
        })
        .promise();
      console.log("uploaded image:", uploadedImage);

      return res
        .status(200)
        .json({ status: UPDATE_PICTURE_SUCCESS, data: uploadedImage.Location });
    } catch (err) {
      return res.status(400).json({ status: UPDATE_PICTURE_FAILED });
    }
  }
}
