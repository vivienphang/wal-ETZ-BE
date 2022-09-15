import { Schema } from "mongoose";

export interface UsersAttributes {
  _id?: Schema.Types.ObjectId;
  id?: Schema.Types.ObjectId;
  googleID?: string;
  email: string;
  username: string;
  password?: string;
  profilePicture?: string;
  defaultCurrency: string;
  accounts?: Schema.Types.ObjectId[];
}
