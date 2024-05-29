import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/ErrorClass.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Schema } from "mongoose";
export interface AuthenticatedInterface extends Request {
  userId?: Schema.Types.ObjectId;
}
const isAuthenticated = (
  req: AuthenticatedInterface,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies["dosti-token"];

  if (!token)
    return next(
      new ErrorHandler("You are Not Authenticated,Please Login", 401)
    );
  let decodeData: JwtPayload;
  try {
    decodeData = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch (error) {
    return next(new ErrorHandler("Invalid Token", 401));
  }
  if (!("id" in decodeData)) {
    return next(new ErrorHandler("Invalid Token", 400));
  }
  req.userId = decodeData.id as Schema.Types.ObjectId;
  next();
};

export { isAuthenticated };
