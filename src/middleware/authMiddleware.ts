import { NextFunction, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import { JWTMiddlewareRequest } from "../types/jwtRequestInterface";
import responseStatus from "./responseStatus";

const { BAD_JWT, EXPIRED_JWT, NO_JWT } = responseStatus;

const authenticateJWT: RequestHandler = async (
  req: JWTMiddlewareRequest,
  res: Response,
  next: NextFunction
) => {
  console.log("checking JWT");
  try {
    const authToken: string | undefined = req
      .header("Authorization")!
      .replace("Bearer ", "");
    if (!authToken) {
      res.status(401).json({ message: NO_JWT });
      return;
    }
    const verifiedToken: string | jwt.JwtPayload = jwt.verify(
      authToken as string,
      process.env.JWT_SECRET as string
    );
    console.log("token verified: ", verifiedToken);
    req.body.id = typeof verifiedToken === "string" ? "" : verifiedToken.id;
  } catch (err) {
    console.log(err);
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: EXPIRED_JWT });
      return;
    }
    res.status(400).json({ message: BAD_JWT });
    return;
  }
  next();
};

export default authenticateJWT;
