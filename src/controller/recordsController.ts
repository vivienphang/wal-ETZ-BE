import { Model, Types } from "mongoose";
import { Request, Response } from "express";
import { AccountsAttributes } from "../types/accountsInterface";
import { RecordsAttributes } from "../types/recordsInterface";
import BaseController from "./baseController";
import responseStatus from "./responseStatus";

const { CREATE_RECORD_FAILED } = responseStatus;

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
      // This id is the account id
      id,
      amount,
      isExpense,
      recordName,
      recordComment,
      recordCategory,
      recordPhoto,
      recordDate,
    } = req.body;
    let newRecord: RecordsAttributes;
    let updateAccount: AccountsAttributes | null;
    // Adding the record into the records table
    try {
      newRecord = await this.model.create({
        amount: Types.Decimal128.fromString(amount),
        isExpense,
        recordName,
        recordCategory,
        recordDate,
        recordComment,
        recordPhoto,
      });
    } catch (err) {
      return res.status(400).json({ status: CREATE_RECORD_FAILED });
    }
    // Add this record id into the corrosponding record
    try {
      updateAccount = await this.accounts.findByIdAndUpdate(id, {
        $push: { records: newRecord.id },
      });
      if (updateAccount === null) {
        throw new Error("Account doesnt exist");
      }
    } catch (err) {
      console.log("Error updating account with new record:", err);
      await this.model.findByIdAndDelete(newRecord.id);
      return res.status(400).json({ status: CREATE_RECORD_FAILED });
    }
    return res.status(200).json({ newRecord });
  }
}
