/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-await-in-loop */
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import connectDB from "./config/config";
import { userModel, recordsModel, accountsModel } from "./model/model";
import currencyList from "./constants/currencyList";
import categoryList from "./constants/categoryList";

require("dotenv").config();

const randomizeIndex = (arrLength: number) => {
  console.log("randomizing index");
  return Math.floor(Math.random() * arrLength);
};

connectDB().then(async () => {
  const firstCurrencyIndex = randomizeIndex(currencyList.length);
  let firstIndexFlag = true;
  const newUser = await userModel.create({
    username: faker.internet.userName(),
    password: bcrypt.hashSync("password", Number(process.env.SALT_ROUNDS)),
    email: faker.internet.email(),
    defaultCurrency: currencyList[firstCurrencyIndex],
    accounts: [],
  });

  for (let i = 0; i < 3; i += 1) {
    const initialRecord = await recordsModel.create({
      amount: 50000,
      isExpense: false,
      recordName: "Initializing Account",
      recordCategory: "Init. Account",
      recordDate: new Date(),
    });

    const newAccount = await accountsModel.create({
      accName: faker.word.noun(),
      accCurrency:
        currencyList[
          firstIndexFlag
            ? firstCurrencyIndex
            : randomizeIndex(currencyList.length)
        ],
      accRecords: [initialRecord.id],
    });

    firstIndexFlag = false;

    for (let j = 0; j < 30; j += 1) {
      const randomAmount = Math.floor(Math.random() * 10000) / 100;
      const isExpense = Math.floor(Math.random() * 2) % 2;
      const newRecord = await recordsModel.create({
        amount: Number(randomAmount),
        isExpense,
        recordName: faker.word.noun(),
        recordCategory: categoryList[randomizeIndex(categoryList.length)],
        recordDate: new Date(),
      });
      await accountsModel.findByIdAndUpdate(
        newAccount.id,
        {
          $push: { accRecords: newRecord.id },
        },
        { returnDocument: "after" }
      );
    }
    await userModel.findByIdAndUpdate(
      newUser.id,
      { $push: { accounts: newAccount.id } },
      { returnDocument: "after" }
    );
  }
  console.log("seeding done");

  const userData = await userModel
    .findById(newUser.id)
    .populate({
      path: "accounts",
      populate: {
        path: "accRecords",
        select: "-createdAt -updatedAt -__v",
        options: { sort: "-recordDate" },
      },
      select: "-createdAt -updatedAt -__v",
    })
    .select("-password -createdAt -updatedAt -__v");

  console.log(userData);
});
