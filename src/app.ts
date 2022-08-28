import express from "express";
import cookieParser from "cookie-parser";
import passport from "passport";
import cors from "cors";
import session from "express-session";

import connectDB from "./config/config";

import { userModel, accountsModel, recordsModel } from "./model/model";

import AccountsController from "./controller/accountsController";
import UserController from "./controller/userController";
import AuthController from "./controller/authController";

import AccountsRoutes from "./routes/accountsRoutes";
import UserRoutes from "./routes/userRoutes";
import AuthRoutes from "./routes/authRoutes";

import authenticateJWT from "./middleware/authMiddleware";
import initPassport from "./authentication/initPassport";

require("dotenv").config();

const app: express.Application = express();
const PORT: number | string = (process.env.PORT as string) || 3030;

// authentication setup
app.use(
  session({
    secret: process.env.GOOGLE_CLIENT_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
initPassport(app);

const userController: UserController = new UserController(userModel);
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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
  })
);
console.log(process.env.FRONT_END_URL);

// passport.authenticate("google");

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/accounts", accountsRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`app is listening at port ${PORT}`);
  });
});
