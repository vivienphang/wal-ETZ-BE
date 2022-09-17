/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-await-in-loop */
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import { DateTime } from "luxon";
import connectDB from "./config/config";
import { userModel, recordsModel, accountsModel } from "./model/model";
import currencyList from "./constants/currencyList";
import { incomeCategories, expenseCategories } from "./constants/categoryList";

require("dotenv").config();

const randomizeIndex = (arrLength: number) => {
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
    const startingDate = DateTime.now()
      .minus({ months: 4 - i })
      .startOf("month")
      .plus({ minutes: 5 });
    const initialRecord = await recordsModel.create({
      amount: 5000,
      isExpense: false,
      recordName: "Initializing Account",
      recordCategory: "Init. Account",
      recordDate: startingDate,
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
        recordCategory: isExpense
          ? expenseCategories[randomizeIndex(expenseCategories.length)]
          : incomeCategories[randomizeIndex(incomeCategories.length)],
        recordDate: startingDate.plus({
          days: randomizeIndex(20),
          hours: randomizeIndex(24),
          minutes: randomizeIndex(60),
          seconds: randomizeIndex(60),
        }),
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
});
