import mongoose, { Model } from "mongoose";
import { Request, Response } from "express";
import { AccountsAttributes } from "../types/accountsInterface";
import { RecordsAttributes } from "../types/recordsInterface";
import BaseController from "./baseController";
import responseStatus from "./responseStatus";

const {
  ADD_RECORD_SUCCEED,
  CREATE_RECORD_FAILED,
  DELETE_RECORD_FAILED,
  UPDATE_ACCOUNT_FAILED,
  UPDATE_RECORD_SUCCEED,
  UPDATE_RECORD_FAILED,
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
      return res.status(400).json({ status: UPDATE_ACCOUNT_FAILED });
    }
    return res
      .status(200)
      .json({ data: updateAccount, status: ADD_RECORD_SUCCEED });
  }

  async editRecord(req: Request, res: Response) {
    console.log("editing existing record");
    const {
      acc,
      recId,
      amount,
      isExpense,
      recordName,
      recordComment,
      recordCategory,
      recordPhoto,
      recordDate,
    } = req.body;
    let updateRecord: RecordsAttributes | null;
    let updateAccount: AccountsAttributes | null;
    try {
      updateRecord = await this.model.findByIdAndUpdate(
        recId,
        {
          amount: Number(amount),
          isExpense,
          recordName,
          recordCategory,
          recordDate,
          recordPhoto,
          recordComment,
        },
        { returnDocument: "after" }
      );
      if (updateRecord == null) {
        throw new Error("no record");
      }
    } catch (err) {
      return res.status(400).json({ status: UPDATE_RECORD_FAILED });
    }
    try {
      updateAccount = await this.accounts
        .findById(acc)
        .populate({
          path: "accRecords",
          options: {
            sort: "-recordDate",
            select: "-createdAt -updatedAt -__v",
          },
        })
        .select("-createdAt -updatedAt -__v");
    } catch (err) {
      return res.status(400).json({ status: UPDATE_ACCOUNT_FAILED });
    }
    return res
      .status(200)
      .json({ status: UPDATE_RECORD_SUCCEED, data: updateAccount });
  }

  async deleteRecord(req: Request, res: Response) {
    const { recId, accId } = req.body;
    let updateAccount: AccountsAttributes | null;
    try {
      await this.model.findByIdAndDelete(recId);
    } catch (err) {
      return res.status(400).json({ status: DELETE_RECORD_FAILED });
    }
    try {
      updateAccount = await this.accounts
        .findByIdAndUpdate(accId, {
          $pull: { accRecords: new mongoose.Types.ObjectId(recId) },
        })
        .populate({
          path: "accRecords",
          options: {
            sort: "-recordDate",
            select: "-createdAt -updatedAt -__v",
          },
        })
        .select("-createdAt -updatedAt -__v");
    } catch (err) {
      return res.status(400).json({ status: UPDATE_ACCOUNT_FAILED });
    }
    return res
      .status(200)
      .json({ status: UPDATE_RECORD_SUCCEED, data: updateAccount });
  }
}
