import { Request } from "express";

interface UserDetails {
  userID: string;
  username: string;
  email: string;
}

export interface JWTRequest extends Request {
  userDetails?: UserDetails;
}
