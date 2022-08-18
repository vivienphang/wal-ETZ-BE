import { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import responseStatus from "./responseStatus";

const { BAD_JWT, EXPIRED_JWT } = responseStatus;

const authenticateJWT: RequestHandler =
  () => async (req: Request, res: Response, next: NextFunction) => {
    console.log("checking JWT");
    try {
      const authToken: string | undefined = req
        .header("Authorization")
        ?.replace("Bearer", "");
      const verifiedToken: string | jwt.JwtPayload = jwt.verify(
        authToken as string,
        process.env.JWT_SECRET as string
      );
      console.log("token verified: ", verifiedToken);
    } catch (err) {
      console.log(err);
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: EXPIRED_JWT });
      }
      return res.status(400).json({ message: BAD_JWT });
    }
    return next();
  };

export default authenticateJWT;
