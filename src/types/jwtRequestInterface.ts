import { Request } from "express";

interface UserDetails {
  id: string;
}

export interface JWTRequest extends Request {
  user?: UserDetails;
}
