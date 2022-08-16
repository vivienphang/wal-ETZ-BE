import { Schema } from "mongoose";

export interface AccountsAttributes {
  accName: string;
  accCurrency: string;
  accRecords: [Schema.Types.ObjectId];
  createdAt?: Date;
  updatedAt?: Date;
}
