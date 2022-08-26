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
        accessToken: any,
        _refreshToken: any,
        profile: {
          id: String;
          displayName: String;
          photos: any;
          emails: any;
        },
        done: any
      ) => {
        console.log("this is profile:", profile);
        console.log("this is access token:", accessToken);
        // using mongoose-find-or-create package
        let userResult;
        try {
          userResult = await userModel.findOne({ googleID: profile.id });
        } catch (err) {
          done(err, profile);
        }
        if (!userResult) {
          try {
            userResult = await userModel.create({
              googleID: profile.id,
              username: profile.displayName,
              email: profile.emails[0].value,
              profilePicture: profile.photos[0].value,
            });
          } catch (err) {
            done(err, profile);
          }
        }
        console.log("this is user result:", userResult);
        done(null, profile);
      }
    )
  );
};

module.exports = googleStrategy;
