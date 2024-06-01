import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Schema } from "mongoose";
import User from "../models/user-model.js";
import { ErrorHandler } from "../utils/ErrorClass.js";

export interface AuthenticatedInterface extends Request {
  userId?: Schema.Types.ObjectId;
}

const isAuthenticated = (
  req: AuthenticatedInterface,
  res: Response,
  next: any
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

const socketAuthenticated = async (socket: any, next: any) => {
  try {
    const token = socket.request.cookies?.["dosti-token"];

    if (!token)
      return next(new ErrorHandler("Please Login Your Not Authenticated", 400));

    let decodeData: JwtPayload;
    decodeData = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await User.findById(decodeData.id);
    socket.user = user;
    next();
  } catch (error) {
    console.log(error, 50);
    next();
  }
};

export { isAuthenticated, socketAuthenticated };
