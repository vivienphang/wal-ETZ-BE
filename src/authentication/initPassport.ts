import { Application } from "express";
import passport from "passport";
import googleStrategy from "./googleStrategy";

const initPassport = (app: Application) => {
  googleStrategy(passport);

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((userModel: globalThis.Express.User, done) => {
    done(null, userModel);
  });

  passport.deserializeUser((userModel: globalThis.Express.User, done) => {
    done(null, userModel);
  });
};

export default initPassport;
