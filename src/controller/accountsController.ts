import { Model } from "mongoose";
import { Request, Response } from "express";
import { AccountsAttributes } from "../types/accountsInterface";
import { RecordsAttributes } from "../types/recordsInterface";
import BaseController from "./baseController";
import { UsersAttributes } from "../types/userInterface";
import responseStatus from "./responseStatus";

const { APPEND_TO_USER_FAILED, CREATE_ACCOUNT_FAILED, CREATE_RECORD_FAILED } =
  responseStatus;

export default class AccountsController extends BaseController {
  public records: Model<RecordsAttributes>;

  public users: Model<UsersAttributes>;

  constructor(
    model: Model<AccountsAttributes>,
    records: Model<RecordsAttributes>,
    users: Model<UsersAttributes>
  ) {
    super(model);
    this.records = records;
    this.users = users;
  }

  async createInitialAccount(req: Request, res: Response) {
    console.log("creating first account");
    const { id, accName, accCurrency, balance: amount } = req.body;
    let userData: UsersAttributes | null;
    let newAccount: AccountsAttributes;
    let newRecord: RecordsAttributes;
    try {
      newRecord = await this.records.create({
        amount: Number(amount),
        isExpense: false,
        recordName: "Initializing Account",
        recordCategory: "Misc.",
        recordDate: new Date(),
      });
    } catch (err) {
      return res.status(400).json({ status: CREATE_RECORD_FAILED });
    }

    try {
      newAccount = await this.model.create({
        accName,
        accCurrency,
        accRecords: [newRecord.id],
      });
    } catch (err) {
      // deleting new record if account creation fail
      await this.records.findByIdAndDelete(newRecord.id);
      return res.status(400).json({ status: CREATE_ACCOUNT_FAILED });
    }

    try {
      userData = await this.users.findByIdAndUpdate(
        id,
        {
          $push: { accounts: newAccount.id },
          $set: { defaultCurrency: accCurrency },
        },
        { returnDocument: "after" }
      );
    } catch (err) {
      // deleting record and account if create failed
      await this.records.findByIdAndDelete(newRecord.id);
      await this.model.findByIdAndDelete(newAccount.id);
      return res.status(400).json({ status: APPEND_TO_USER_FAILED });
    }
    return res.status(200).json({ newRecord, newAccount, userData });
  }

  async createNewAccount(req: Request, res: Response) {
    console.log("creating new account");
    const { id, accName, accCurrency, balance: amount } = req.body;
    let userData: UsersAttributes | null;
    let newAccount: AccountsAttributes;
    let newRecord: RecordsAttributes;
    try {
      newRecord = await this.records.create({
        amount: Number(amount),
        isExpense: false,
        recordName: "Initializing Account",
        recordCategory: "Misc.",
        recordDate: new Date(),
      });
    } catch (err) {
      return res.status(400).json({ status: CREATE_RECORD_FAILED });
    }

    try {
      newAccount = await this.model.create({
        accName,
        accCurrency,
        accRecords: [newRecord.id],
      });
    } catch (err) {
      // deleting new record if account creation fail
      await this.records.findByIdAndDelete(newRecord.id);
      return res.status(400).json({ status: CREATE_ACCOUNT_FAILED });
    }

    try {
      userData = await this.users.findByIdAndUpdate(
        id,
        {
          $push: { accounts: newAccount.id },
        },
        { returnDocument: "after" }
      );
    } catch (err) {
      // deleting record and account if create failed
      await this.records.findByIdAndDelete(newRecord.id);
      await this.model.findByIdAndDelete(newAccount.id);
      return res.status(400).json({ status: APPEND_TO_USER_FAILED });
    }
    return res.status(200).json({ newRecord, newAccount, userData });
  }
}
