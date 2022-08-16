import { Schema } from "mongoose";

export interface RecordsAttributes {
  amount: Schema.Types.Decimal128;
  isExpense: boolean;
  recordName?: string;
  recordComment?: string;
  recordCategory?: string;
  recordPhoto?: string;
  recordDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
