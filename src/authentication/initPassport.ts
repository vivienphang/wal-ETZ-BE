import { Express } from "express";
import passport from "passport";
import googleStrategy from "./googleStrategy";

const initPassport = (app: any) => {
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((userModel: Express.User, done) => {
    done(null, userModel);
  });

  passport.deserializeUser((userModel: Express.User, done) => {
    done(null, userModel);
  });

  googleStrategy(passport);
};

export default initPassport;
