// import findOrCreate from "mongoose-find-or-create";
import { userModel } from "../model/model";

const GoogleStrategy = require("passport-google-oauth20").Strategy;

require("./initPassport");

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

//   Use the GoogleStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Google profile), and
//   invoke a callback with a user object.

const googleStrategy = (passport: any) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (
        _accessToken: any,
        _refreshToken: any,
        profile: { id: any },
        done: any
      ) => {
        console.log("this is profile:", profile);
        // using mongoose-find-or-create package
        const userResult = await userModel.findOne(
          { googleId: profile.id }

          // (err: any, userModel: any) => {
          //   done(err, profile);
          // }
        );
        console.log("this is user result:", userResult);
      }
    )
  );
};

module.exports = googleStrategy;
