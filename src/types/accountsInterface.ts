import { Schema } from "mongoose";

export interface AccountsAttributes {
  id?: Schema.Types.ObjectId;
  accName: string;
  accCurrency: string;
  accRecords?: Schema.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}
