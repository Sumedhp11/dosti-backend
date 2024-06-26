import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user-model.js";
import { ErrorHandler } from "../utils/ErrorClass.js";
import { uploadFilesToCloudinary } from "../utils/cloudinary.js";
import { sendEmail } from "../utils/sendEmail.js";
import Notifications from "../models/notification-model.js";
import { emitEvent } from "../utils/socketCookieParser.js";
import { friendRequest, friendRequestAccepted } from "../constants/Events.js";
const newUser = async (req, res, next) => {
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
        let verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
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
        const emailResponse = await sendEmail(email, "Verification Code", verificationToken);
        if (!emailResponse.success) {
            return next(new ErrorHandler("Failed to send Email", 500));
        }
        return res.status(201).json({
            success: true,
            message: "User Registered Successfully Please Verify",
        });
    }
    catch (error) {
        console.log(error);
        return next(new ErrorHandler("Internal Server Error", 500));
    }
};
const checkUsernameExist = async (req, res, next) => {
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
        }
        catch (error) { }
    }
    catch (error) {
        console.log(error);
        return next(new ErrorHandler("Internal Server Error", 500));
    }
};
const VerifyUser = async (req, res, next) => {
    try {
        const { verificationCode } = req.body;
        if (!verificationCode)
            return next(new ErrorHandler("Please Enter Verification Code", 400));
        const existingUser = await User.findOne({
            IsVerifiedToken: verificationCode,
        });
        if (!existingUser)
            return next(new ErrorHandler("Invalid verification code", 400));
        if (!existingUser.IsVerifiedTokenExpiry ||
            existingUser.IsVerifiedTokenExpiry.getTime() <= Date.now()) {
            await existingUser.deleteOne();
            return next(new ErrorHandler("Verification code expired. Please register again", 400));
        }
        existingUser.isVerified = true;
        existingUser.IsVerifiedToken = undefined;
        existingUser.IsVerifiedTokenExpiry = undefined;
        await existingUser.save();
        return res.status(200).json({
            success: true,
            message: "User Verified Successfully",
        });
    }
    catch (error) {
        console.log(error);
        return next(new ErrorHandler("Internal Server Error", 500));
    }
};
const loginUser = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return next(new ErrorHandler("Please Provide Credentials", 400));
        const existingUser = await User.findOne({ username });
        if (!existingUser)
            return next(new ErrorHandler("User Does Not Exists", 400));
        if (!existingUser.isVerified)
            return next(new ErrorHandler("Please Verify Your Account Before Login", 400));
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch)
            return next(new ErrorHandler("Invalid Credentials", 400));
        const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET);
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
    }
    catch (error) {
        console.log(error);
        return next(new ErrorHandler("Internal Server Error", 500));
    }
};
const forgetPasswordemailController = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email)
            return next(new ErrorHandler("Please Provide Email", 400));
        const existingUser = await User.findOne({
            email,
        });
        if (!existingUser)
            return next(new ErrorHandler("User Does Not Exists", 400));
        let forgetPasswordToken = Math.floor(100000 + Math.random() * 900000).toString();
        const codeExpiryDate = new Date(Date.now() + 15 * 60 * 1000);
        existingUser.resetPasswordToken = forgetPasswordToken;
        existingUser.resetPasswordTokenExpiry = codeExpiryDate;
        const emailResponse = await sendEmail(email, "Reset Password Code", forgetPasswordToken, codeExpiryDate);
        if (!emailResponse.success)
            return next(new ErrorHandler("Failed To Send Email", 400));
        await existingUser.save();
        return res.status(200).json({
            success: true,
            message: "Forget Password Sent to your Email Successfully",
        });
    }
    catch (error) {
        console.log(error);
        return next(new ErrorHandler("Internal Server Error", 500));
    }
};
const resetPassword = async (req, res, next) => {
    try {
        const { code, password } = req.body;
        if (!code || !password)
            return next(new ErrorHandler("Please Provide Forget Password Code and new Password", 400));
        const existingUser = await User.findOne({
            resetPasswordToken: code,
        });
        if (!existingUser)
            return next(new ErrorHandler("Invalid Forget Password Code", 400));
        if (!existingUser.resetPasswordTokenExpiry ||
            existingUser.resetPasswordTokenExpiry.getTime() <= Date.now())
            return next(new ErrorHandler("Reset Password code expired. Please Get a New Code", 400));
        const HashedPw = await bcrypt.hash(password, 10);
        existingUser.password = HashedPw;
        existingUser.resetPasswordToken = undefined;
        existingUser.resetPasswordTokenExpiry = undefined;
        await existingUser.save();
        res.status(200).json({
            success: true,
            message: "Password reset successful",
        });
    }
    catch (error) {
        console.log(error);
        return next(new ErrorHandler("Internal Server Error", 500));
    }
};
const GetMyProfile = async (req, res, next) => {
    try {
        const userId = req.userId;
        console.log(userId, 256);
        const existinguser = await User.findById(userId)
            .select("-password")
            .populate({
            path: "friends",
            model: "User",
        });
        return res.status(200).json({
            success: true,
            message: "User Data Retrieved Successfully",
            data: existinguser,
        });
    }
    catch (error) {
        console.log(error);
        return next(new ErrorHandler("Internal Server Error", 500));
    }
};
const logoutController = async (req, res, next) => {
    return res.status(200).cookie("dosti-token", "", { maxAge: 0 }).json({
        success: true,
        message: "Logout Succesfull",
    });
};
const sendFriendRequest = async (req, res, next) => {
    try {
        const { receiverUserId } = req.params;
        if (!receiverUserId)
            return next(new ErrorHandler("Please Provide Receiver's User Id", 400));
        const alreadyExistingNotificationRequest = await Notifications.findOne({
            $or: [
                { relatedUser: receiverUserId, userId: req.userId },
                {
                    userId: req.userId,
                    relatedUser: receiverUserId,
                },
            ],
            type: "Friend_Request",
        });
        if (alreadyExistingNotificationRequest)
            return next(new ErrorHandler("Friend Request has Already Been Sent", 400));
        const newFriendRequestNotification = new Notifications({
            userId: req.userId,
            message: `${req.userId} Has Sent you a Friend Request`,
            relatedUser: receiverUserId,
            type: "Friend_Request",
        });
        await newFriendRequestNotification.save();
        emitEvent(req, friendRequest, [receiverUserId]);
        return res.status(200).json({
            success: true,
            message: "Friend Request Sent Successful",
        });
    }
    catch (error) {
        console.log(error);
        return next(new ErrorHandler("Internal Server Error", 500));
    }
};
const ManageFriendRequest = async (req, res, next) => {
    try {
        const { action, notificationId } = req.body;
        const alreadyExistingNotificationRequest = await Notifications.findById(notificationId);
        if (action === "accept") {
            const [user, relatedUser] = await Promise.all([
                User.findById(alreadyExistingNotificationRequest?.userId),
                User.findById(alreadyExistingNotificationRequest?.relatedUser),
            ]);
            if (user && relatedUser) {
                user?.friends.push(relatedUser._id);
                relatedUser?.friends.push(user._id);
            }
            await user?.save();
            await relatedUser?.save();
            await alreadyExistingNotificationRequest?.deleteOne();
            emitEvent(req, friendRequestAccepted, [relatedUser?._id], `${user} Accepted Your Friend Request`);
            const newNotification = new Notifications({
                userId: relatedUser?._id,
                message: `${user?._id} Accepted Your Friend Request`,
                relatedUser: user?._id,
                type: "Friend_Request",
            });
            await newNotification.save();
            return res.status(200).json({
                success: true,
                message: "Friend Request Accepted Successfully",
            });
        }
        if (action === "rejected") {
            await alreadyExistingNotificationRequest?.deleteOne();
            return res.status(200).json({
                success: true,
                message: "Friend Request Rejected Successfully",
            });
        }
    }
    catch (error) {
        console.log(error);
        return next(new ErrorHandler("Internal Server Error", 500));
    }
};
const getAllUsers = async (req, res, next) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const friendIds = user.friends.map((friend) => friend._id);
        const users = await User.find({ _id: { $ne: userId, $nin: friendIds } });
        return res.status(200).json({
            success: true,
            message: "Users Retrieved Successfully",
            data: users,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
const editProfile = async (req, res, next) => {
    try {
        const { fullName, username, phone, email } = req.body;
        const file = req.file;
        let avatar;
        if (file) {
            const result = await uploadFilesToCloudinary([file]);
            avatar = result[0].public_id;
        }
        const alreadySavedUser = await User.findById(req.userId);
        if (!alreadySavedUser)
            return next(new ErrorHandler("User Doesnt Exist", 400));
        alreadySavedUser.fullName = fullName;
        alreadySavedUser.username = username;
        alreadySavedUser.phone = phone;
        alreadySavedUser.email = email;
        if (avatar) {
            alreadySavedUser.avatar = avatar;
        }
        await alreadySavedUser.save();
        return res.status(200).json({
            success: true,
            message: "User Updated Successfully",
        });
    }
    catch (error) {
        console.log(error);
        return next(new ErrorHandler("Internal Server Error", 500));
    }
};
export { GetMyProfile, editProfile, VerifyUser, checkUsernameExist, forgetPasswordemailController, loginUser, logoutController, newUser, resetPassword, sendFriendRequest, ManageFriendRequest, getAllUsers, };
