import GoogleOAuth, {
  Strategy as GoogleStrategy,
} from "passport-google-oauth20";
import { userModel } from "../model/model";

require("dotenv").config();

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
    profile: GoogleOAuth.Profile,
    done: GoogleOAuth.VerifyCallback
  ) => {
    console.log("this is profile:", profile);
    console.log("this is access token:", accessToken);
    console.log("this is refresh token:", refreshToken);
    let userResult;

    const { id, displayName, emails, photos } = profile;

    userResult = await userModel.findOne({
      email: emails[0].value,
    });
    console.log("USER?", userResult);
    if (!userResult) {
      userResult = await userModel.create({
        googleID: id,
        username: displayName,
        email: emails ? emails[0].value : null,
        profilePicture: photos ? photos[0].value : null,
      });
    }

    console.log("this is user result:", userResult);
    done(null, userResult);
  }
);

export default (passport: any) => {
  passport.use(googleStrategy);
};
