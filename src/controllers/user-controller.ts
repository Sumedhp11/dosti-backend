import { NextFunction, Request, Response } from "express";
import User from "../models/user-model.js";
import { ErrorHandler } from "../utils/ErrorClass.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { sendEmail } from "../utils/sendEmail.js";
import { uploadFilesToCloudinary } from "../utils/cloudinary.js";

const newUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullName, username, phone, email, password } = req.body;
    const file = req.file;
    if (!file)
      return next(new ErrorHandler("Please Upload Profile Picture", 400));
    const result = await uploadFilesToCloudinary([file]);

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
      avatar: result[0].public_id,
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
const VerifyUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { verificationCode } = req.body;
    if (!verificationCode)
      return next(new ErrorHandler("Please Enter Verification Code", 400));

    const existingUser = await User.findOne({
      IsVerifiedToken: verificationCode,
    });
    if (!existingUser)
      return next(new ErrorHandler("Invalid verification code", 400));

    if (
      !existingUser.IsVerifiedTokenExpiry ||
      existingUser.IsVerifiedTokenExpiry.getTime() <= Date.now()
    ) {
      await existingUser.deleteOne();
      return next(
        new ErrorHandler(
          "Verification code expired. Please register again",
          400
        )
      );
    }
    existingUser.isVerified = true;
    existingUser.IsVerifiedToken = undefined;
    existingUser.IsVerifiedTokenExpiry = undefined;
    await existingUser.save();

    return res.status(200).json({
      success: true,
      message: "User Verified Successfully",
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return next(new ErrorHandler("Please Provide Credentials", 400));
    const existingUser = await User.findOne({ username });
    if (!existingUser)
      return next(new ErrorHandler("User Does Not Exists", 400));

    if (!existingUser.isVerified)
      return next(
        new ErrorHandler("Please Verify Your Account Before Login", 400)
      );
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) return next(new ErrorHandler("Invalid Credentials", 400));

    const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET!);
    return res
      .status(200)
      .cookie("dosti-token", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        sameSite: "none",
        httpOnly: true,
        secure: true,
      })
      .json({
        success: true,
        message: `Welcome ${existingUser.username}`,
        user: existingUser,
      });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

const forgetPasswordemailController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    if (!email) return next(new ErrorHandler("Please Provide Email", 400));
    const existingUser = await User.findOne({
      email,
    });
    if (!existingUser)
      return next(new ErrorHandler("User Does Not Exists", 400));
    let forgetPasswordToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const codeExpiryDate = new Date(Date.now() + 15 * 60 * 1000);
    existingUser.resetPasswordToken = forgetPasswordToken;
    existingUser.resetPasswordTokenExpiry = codeExpiryDate;

    const emailResponse = await sendEmail(
      email,
      "Reset Password Code",
      forgetPasswordToken,
      codeExpiryDate
    );
    if (!emailResponse.success)
      return next(new ErrorHandler("Failed To Send Email", 400));
    await existingUser.save();
    return res.status(200).json({
      success: true,
      message: "Forget Password Sent to your Email Successfully",
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, password } = req.body;
    if (!code || !password)
      return next(
        new ErrorHandler(
          "Please Provide Forget Password Code and new Password",
          400
        )
      );
    const existingUser = await User.findOne({
      resetPasswordToken: code,
    });
    if (!existingUser)
      return next(new ErrorHandler("Invalid Forget Password Code", 400));
    if (
      !existingUser.resetPasswordTokenExpiry ||
      existingUser.resetPasswordTokenExpiry.getTime() <= Date.now()
    )
      return next(
        new ErrorHandler(
          "Reset Password code expired. Please Get a New Code",
          400
        )
      );
    const HashedPw = await bcrypt.hash(password, 10);
    existingUser.password = HashedPw;
    existingUser.resetPasswordToken = undefined;
    existingUser.resetPasswordTokenExpiry = undefined;
    await existingUser.save();
    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};
export {
  newUser,
  checkUsernameExist,
  VerifyUser,
  loginUser,
  forgetPasswordemailController,
  resetPassword,
};
