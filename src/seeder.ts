/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-await-in-loop */
import { faker } from "@faker-js/faker";
import { Types } from "mongoose";
import bcrypt from "bcrypt";
import connectDB from "./config/config";
import { userModel, recordsModel, accountsModel } from "./model/model";

require("dotenv").config();

const currencyList = [
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
];

const randomInitialCurrencyIndex = Math.floor(
  Math.random() * currencyList.length
);

connectDB().then(async () => {
  const initialRecord = await recordsModel.create({
    amount: Types.Decimal128.fromString(
      String(Math.floor(Math.random() * 10000))
    ),
    isExpense: false,
    recordName: "Initializing Account",
    recordCategory: "Misc.",
    recordDate: new Date(),
  });

  const initialAccount = await accountsModel.create({
    accName: faker.word.noun(),
    accCurrency: currencyList[randomInitialCurrencyIndex],
    accRecords: [initialRecord.id],
  });

  const newUser = await userModel.create({
    username: faker.internet.userName(),
    password: bcrypt.hashSync("password", Number(process.env.SALT_ROUNDS)),
    email: faker.internet.email(),
    defaultCurrency: currencyList[randomInitialCurrencyIndex],
    accounts: [initialAccount.id],
  });

  for (let i = 0; i < 30; i += 1) {
    const randomAmount = Math.floor(Math.random() * 10000);
    const isExpense = Math.floor(Math.random() * 10000) % 2;
    const newRecord = await recordsModel.create({
      amount: Types.Decimal128.fromString(String(randomAmount)),
      isExpense,
      recordName: faker.word.noun(),
      recordCategory: "Misc.",
      recordDate: new Date(),
    });
    await accountsModel.findByIdAndUpdate(
      initialAccount.id,
      {
        $push: { accRecords: newRecord.id },
      },
      { returnDocument: "after" }
    );
  }
  console.log("seeding done");
});
