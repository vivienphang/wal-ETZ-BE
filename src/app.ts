import express from "express";
import cookieParser from "cookie-parser";
import passport from "passport";
import cors from "cors";
import session from "express-session";
import connectDB from "./config/config";
import { userModel } from "./model/model";
import UserController from "./controller/userController";
import UserRoutes from "./routes/userRoutes";
import authenticateJWT from "./middleware/authMiddleware";
connectDB();

const app: express.Application = express();
const PORT: number | string = (process.env.PORT as string) || 3030;

// authentication setup
import initPassport from "./authentication/initPassport";
import AuthRoutes from "./routes/authRoutes";
import AuthController from "./controller/authController";
app.use(
  session({
    secret: "helloWorld",
    resave: false,
    saveUninitialized: true,
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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL as string,
  })
);

passport.authenticate("google");

app.use("/users", userRoutes);
app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`app is listening at port ${PORT}`);
});

function cb(err: any, user: any) {
  throw new Error("Function not implemented.");
}
