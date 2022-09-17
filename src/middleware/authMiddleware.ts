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
  try {
    const authToken: string | undefined = req
      .header("Authorization")!
      .replace("Bearer ", "");
    if (!authToken) {
      res.status(401).json({ status: NO_JWT });
      return;
    }
    const verifiedToken: string | jwt.JwtPayload = jwt.verify(
      authToken as string,
      process.env.JWT_SECRET as string
    );
    req.body.id = typeof verifiedToken === "string" ? "" : verifiedToken.id;
  } catch (err) {
    console.log(err);
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ status: EXPIRED_JWT });
      return;
    }
    res.status(400).json({ status: BAD_JWT });
    return;
  }
  next();
};

export default authenticateJWT;
