import { Request } from "express";

export interface customUser {
  _id?: string;
}

export interface customReq extends Request {
  user: customUser;
}
