import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";

import connectDB from "./config/config";

import { userModel, accountsModel, recordsModel } from "./model/model";

import AccountsController from "./controller/accountsController";
import UserController from "./controller/userController";
import AuthController from "./controller/authController";
import RecordsController from "./controller/recordsController";

import AccountsRoutes from "./routes/accountsRoutes";
import UserRoutes from "./routes/userRoutes";
import RecordsRoutes from "./routes/recordsRoutes";
import AuthRoutes from "./routes/authRoutes";

import authenticateJWT from "./middleware/authMiddleware";
import initPassport from "./authentication/initPassport";

import redisConfig from "./redis/redisConfig";

require("dotenv").config();

const app: express.Application = express();
const PORT: number | string = process.env.PORT || 3030;

// authentication setup
app.use(
  session({
    secret: process.env.GOOGLE_CLIENT_SECRET as string,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
initPassport(app);

const userController: UserController = new UserController(
  userModel,
  redisConfig
);
const userRoutes: express.Router = new UserRoutes(
  userController,
  authenticateJWT
).routes();

const authController: AuthController = new AuthController(userModel);
const authRoutes: express.Router = new AuthRoutes(
  authController,
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

const recordsController: RecordsController = new RecordsController(
  recordsModel,
  accountsModel
);
const recordsRoutes: express.Router = new RecordsRoutes(
  recordsController,
  authenticateJWT
).routes();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
  })
);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/accounts", accountsRoutes);
app.use("/records", recordsRoutes);

userController.init().then(() => {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`app is listening at port ${PORT}`);
    });
  });
});
