import { Request, Response } from "express";
import { Model } from "mongoose";
// import { AccountsAttributes } from "../types/accountsInterface";
// import { RecordsAttributes } from "../types/recordsInterface";
// import { UsersAttributes } from "../types/userInterface";
import responseStatus from "./responseStatus";

const { BAD_CONNECTION, QUERY_COMPLETE, NOT_FOUND } = responseStatus;

export default class BaseController {
  public model: Model<any>;

  constructor(model: Model<any>) {
    this.model = model;
  }

  async getAll(req: Request, res: Response) {
    console.log("getting all data");
    let results: object;
    try {
      results = await this.model.find();
    } catch (err) {
      console.log(err);
      return res.status(400).json({ status: BAD_CONNECTION });
    }
    return res.status(200).json({ status: QUERY_COMPLETE, data: results });
  }

  async getOne(req: Request, res: Response) {
    console.log("getting one data");
    console.log("params: ", req.params);
    console.log("body: ", req.body);
    const { params, body } = req;
    let results: object | null;
    try {
      results = await this.model.findOne({ ...params, ...body });
      if (results === null) {
        throw new Error(NOT_FOUND);
      }
    } catch (err) {
      if (err === NOT_FOUND) {
        return res.status(400).json({ status: NOT_FOUND });
      }
      return res.status(400).json({ status: BAD_CONNECTION });
    }
    return res.status(200).json({ status: QUERY_COMPLETE, data: results });
  }

  async createOne(req: Request, res: Response) {
    console.log("creating one entry");
    console.log("body: ", req.body);
    const { body } = req;
    let newEntry;
    try {
      newEntry = await this.model.create({ ...body });
    } catch (err) {
      return res.status(400).json({ status: BAD_CONNECTION });
    }
    return res.status(200).json({ status: QUERY_COMPLETE, data: newEntry });
  }
}
