import express from "express";
import connectDB from "./config/config";
import { userModel, accountsModel, recordsModel } from "./model/model";

require("dotenv").config();

connectDB();

const app: express.Application = express();
const PORT: number | string = process.env.PORT || 3030;

app.listen(PORT, () => {
  console.log(`app is listening at port ${PORT}`);
});
