import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/config";
import { userModel, accountsModel, recordsModel } from "./model/model";
import AccountsController from "./controller/accountsController";
import UserController from "./controller/userController";
import UserRoutes from "./routes/userRoutes";
import authenticateJWT from "./middleware/authMiddleware";
import AccountsRoutes from "./routes/accountsRoutes";

require("dotenv").config();

connectDB();

const app: express.Application = express();
const PORT: number | string = (process.env.PORT as string) || 3030;

const userController: UserController = new UserController(userModel);
const userRoutes: express.Router = new UserRoutes(
  userController,
  authenticateJWT
).routes();

const accountsController: AccountsController = new AccountsController(
  accountsModel,
  recordsModel,
  userModel
);
const accountsRoutes: express.Router = new AccountsRoutes(
  accountsController,
  authenticateJWT
).routes();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL as string,
  })
);

app.use("/users", userRoutes);
app.use("/accounts", accountsRoutes);

app.listen(PORT, () => {
  console.log(`app is listening at port ${PORT}`);
});
