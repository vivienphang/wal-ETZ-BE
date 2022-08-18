import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/config";
import { userModel } from "./model/model";
import UserController from "./controller/userController";
import UserRoutes from "./routes/userRoutes";
import authenticateJWT from "./middleware/authMiddleware";

require("dotenv").config();

connectDB();

const app: express.Application = express();
const PORT: number | string = (process.env.PORT as string) || 3030;

const userController: UserController = new UserController(userModel);
const userRoutes: express.Router = new UserRoutes(
  userController,
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

app.listen(PORT, () => {
  console.log(`app is listening at port ${PORT}`);
});
