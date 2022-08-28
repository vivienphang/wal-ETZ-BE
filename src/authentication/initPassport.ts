import Express from "express";
import passport from "passport";
import googleStrategy from "./googleStrategy";

const initPassport = (app: any) => {
  googleStrategy(passport);

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((userModel: Express.User, done) => {
    console.log("serializing user");
    console.log("----> serialized userModel:", userModel);
    done(null, userModel);
  });

  passport.deserializeUser((userModel: Express.User, done) => {
    console.log("DEserializing user");
    console.log("----> deserialized userModel:", userModel);
    done(null, userModel);
  });
};

export default initPassport;
