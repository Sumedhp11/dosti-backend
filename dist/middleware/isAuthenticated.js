import { ErrorHandler } from "../utils/ErrorClass.js";
import jwt from "jsonwebtoken";
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
export { isAuthenticated };
