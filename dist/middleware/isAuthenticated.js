import jwt from "jsonwebtoken";
import User from "../models/user-model.js";
import { ErrorHandler } from "../utils/ErrorClass.js";
const isAuthenticated = (req, res, next) => {
    const token = req.cookies["dosti-token"];
    if (!token)
        return next(new ErrorHandler("You are Not Authenticated,Please Login", 401));
    let decodeData;
    try {
        decodeData = jwt.verify(token, process.env.JWT_SECRET);
    }
    catch (error) {
        return next(new ErrorHandler("Invalid Token", 401));
    }
    if (!("id" in decodeData)) {
        return next(new ErrorHandler("Invalid Token", 400));
    }
    req.userId = decodeData.id;
    next();
};
const socketAuthenticated = async (socket, next) => {
    try {
        const token = socket.request.cookies?.["dosti-token"];
        if (!token)
            return next(new ErrorHandler("Please Login Your Not Authenticated", 400));
        let decodeData;
        decodeData = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decodeData.id);
        socket.user = user;
        next();
    }
    catch (error) {
        console.log(error, 50);
        next();
    }
};
export { isAuthenticated, socketAuthenticated };
