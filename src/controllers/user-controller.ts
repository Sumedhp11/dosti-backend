import { NextFunction, Request, Response } from "express";
import User from "../models/user-model.js";
import { ErrorHandler } from "../utils/ErrorClass.js";
import bcrypt from "bcryptjs";

import { sendEmail } from "../utils/sendEmail.js";

const newUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullName, username, phone, email, avatar, password } = req.body;

    if (!fullName || !username || !phone || !email || !password)
      return next(new ErrorHandler("Please Provide Credentials", 400));
    const alreadySavedUser = await User.findOne({
      email,
      isVerified: true,
    });
    if (alreadySavedUser)
      return next(new ErrorHandler("User Already Exists", 400));
    const HashedPw = await bcrypt.hash(password, 10);
    let verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const newSavedUser = new User({
      fullName: fullName,
      username: username,
      phone,
      avatar: "",
      password: HashedPw,
      email,
      friends: [],
      isVerified: false,
      IsVerifiedToken: verificationToken,
      IsVerifiedTokenExpiry: Date.now() + 10800000,
      resetPasswordToken: undefined,
      resetPasswordTokenExpiry: undefined,
    });
    await newSavedUser.save();
    const emailResponse = await sendEmail(
      email,
      "Verification Code",
      verificationToken
    );
    if (!emailResponse.success) {
      return next(new ErrorHandler("Failed to send Email", 500));
    }
    return res.status(201).json({
      success: true,
      message: "User Registered Successfully Please Verify",
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

const checkUsernameExist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.body;
    if (!username)
      return next(new ErrorHandler("Please Provide Username", 400));
    try {
      const existingusername = await User.findOne({
        username,
        isVerified: true,
      });
      if (existingusername)
        return next(new ErrorHandler("Username Already taken", 400));

      return res.status(200).json({
        success: true,
        message: "UserName Available",
      });
    } catch (error) {}
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export { newUser, checkUsernameExist };
