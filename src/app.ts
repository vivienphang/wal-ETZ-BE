import express from "express";
import cookieParser from "cookie-parser";
import connectDB from "./config/config";
import { userModel } from "./model/model";
import UserController from "./controller/userController";
import UserRoutes from "./routes/userRoutes";

require("dotenv").config();

connectDB();

const app: express.Application = express();
const PORT: number | string = process.env.PORT || 3030;

const userController: UserController = new UserController(userModel);
const userRoutes = new UserRoutes(userController, "middleware tba").routes();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/users", userRoutes);

app.listen(PORT, () => {
  console.log(`app is listening at port ${PORT}`);
});
