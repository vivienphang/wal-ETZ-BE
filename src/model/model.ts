import { model, Schema } from "mongoose";

const friendsSchema: Schema = new Schema({
  username: { type: String },
});

const friendRequestSchema: Schema = new Schema({
  username: { type: String },
});

const receivedRequestSchema: Schema = new Schema({
  username: { type: String },
});

const recordsSchema: Schema = new Schema(
  {
    amount: { type: Schema.Types.Decimal128, required: true },
    isExpense: { type: Boolean, required: true },
    recordName: { type: String },
    recordComment: { type: String },
    recordCategory: { type: String },
    recordPhoto: { type: String },
    recordDate: { type: String },
  },
  {
    timestamps: true,
  }
);

const accountsSchema: Schema = new Schema(
  {
    accName: { type: String, required: true },
    accCurrency: {
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
    // this refers to records model
    accRecords: [{ type: Schema.Types.ObjectId }],
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
    accounts: [{ type: Schema.Types.ObjectId }],
  },
  { timestamps: true }
);

export const userModel = model("user", userSchema);
export const accountsModel = model("accounts", accountsSchema);
export const recordsModel = model("records", recordsSchema);
