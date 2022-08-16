import { Model, model, Schema } from "mongoose";
import { AccountsAttributes } from "../types/accountsSchema";
import { FriendAttributes } from "../types/friendInterface";
import { RecordsAttributes } from "../types/recordsInterface";

const friendsSchema: Schema<FriendAttributes> = new Schema<FriendAttributes>({
  username: { type: String },
});

const friendRequestSchema: Schema<FriendAttributes> =
  new Schema<FriendAttributes>({
    username: { type: String },
  });

const receivedRequestSchema: Schema<FriendAttributes> =
  new Schema<FriendAttributes>({
    username: { type: String },
  });

const recordsSchema: Schema<RecordsAttributes> = new Schema<RecordsAttributes>(
  {
    amount: { type: Schema.Types.Decimal128, required: true },
    isExpense: { type: Boolean, required: true },
    recordName: { type: String },
    recordComment: { type: String },
    recordCategory: { type: String },
    recordPhoto: { type: String },
    recordDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

const accountsSchema: Schema<AccountsAttributes> =
  new Schema<AccountsAttributes>(
    {
      accName: { type: String, required: true },
      accCurrency: {
        type: String,
        required: true,
        enum: [
          "SGD",
          "MYR",
          "IDR",
          "THB",
          "HKD",
          "CNY",
          "JPY",
          "USD",
          "AUD",
          "VND",
          "TWD",
        ],
      },
      // this refers to records model
      accRecords: [{ type: Schema.Types.ObjectId, ref: "records" }],
    },
    { timestamps: true }
  );

const userSchema: Schema = new Schema(
  {
    email: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true,
      match: /.+@.+\..+/,
    },
    username: { type: String },
    password: { type: String },
    profilePicture: { type: String },
    defaultCurrency: {
      type: String,
      enum: [
        "SGD",
        "MYR",
        "IDR",
        "THB",
        "HKD",
        "CNY",
        "JPY",
        "USD",
        "AUD",
        "VND",
        "TWD",
      ],
    },
    friends: [friendsSchema],
    friendRequest: [friendRequestSchema],
    receivedRequest: [receivedRequestSchema],
    // this refers to accounts model
    accounts: [{ type: Schema.Types.ObjectId, ref: "accounts" }],
  },
  { timestamps: true }
);

export const userModel = model("user", userSchema);
export const accountsModel: Model<AccountsAttributes> = model(
  "accounts",
  accountsSchema
);
export const recordsModel: Model<RecordsAttributes> = model(
  "records",
  recordsSchema
);
