import { Schema } from "mongoose";
import { FriendAttributes } from "./friendInterface";

export interface UsersAttributes {
  email: string;
  username: string;
  password: string;
  profilePicture?: string;
  defaultCurrency: string;
  friends?: Array<FriendAttributes>;
  friendRequest?: Array<FriendAttributes>;
  receivedRequest?: Array<FriendAttributes>;
  accounts?: [Schema.Types.ObjectId];
}
