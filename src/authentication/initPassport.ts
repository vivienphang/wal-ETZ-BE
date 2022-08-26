// eslint-disable-next-line import/no-import-module-exports
import passport from "passport";
// import googleStrategy from "./googleStrategy";

const initPassport = (app: any) => {
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((userModel, done) => {
    done(null, userModel);
  });

  passport.deserializeUser((userModel, done) => done(null, userModel));

  // eslint-disable-next-line global-require
  require("./googleStrategy")(passport);
};

export default initPassport;
