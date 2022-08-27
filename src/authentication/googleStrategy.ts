import GoogleOauth from "passport-google-oauth20";
import { userModel } from "../model/model";

require("dotenv").config();

const GoogleStrategy = GoogleOauth.Strategy;

require("./initPassport");

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

const googleStrategy = new GoogleStrategy(
  {
    clientID: GOOGLE_CLIENT_ID as string,
    clientSecret: GOOGLE_CLIENT_SECRET as string,
    callbackURL: "/auth/google/callback",
  },
  async (
    accessToken: string,
    refreshToken: string,
    profile: GoogleOauth.Profile,
    done: GoogleOauth.VerifyCallback
  ) => {
    console.log("this is profile:", profile);
    console.log("this is access token:", accessToken);
    console.log("this is refresh token:", refreshToken);
    let userResult;
    try {
      userResult = await userModel.findOne({ googleID: profile.id });
    } catch (err) {
      done(err as string, profile);
    }
    if (!userResult) {
      try {
        userResult = await userModel.create({
          googleID: profile.id,
          username: profile.displayName,
          email: profile.emails ? profile.emails[0].value : null,
          profilePicture: profile.photos ? profile.photos[0].value : null,
        });
      } catch (err) {
        done(err as string, profile);
      }
    }
    console.log("this is user result:", userResult);
    done(null, profile);
  }
);

export default (passport: any) => {
  passport.use(googleStrategy);
};
