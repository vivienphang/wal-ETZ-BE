
import passport from "passport";
import GoogleStrategy from ('passport-google-oauth20').Strategy;
import { userModel } from "./model/model";


const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/google/callback",
    },
    function (accessToken: any, refreshToken: any, profile: { id: any; }, done: any) {
      done(null, profile)
      // if using mongoDB
      // const user = {
      //   username: profile.username,
      //   email: profile.email,
      //   password: hashedPassword
      // }
    }
  )
);

passport.serializeUser( (userModel, done) => {
  done(null, userModel)
})

passport.deserializeUser( (userModel, done) => {
  done(null, userModel);
})