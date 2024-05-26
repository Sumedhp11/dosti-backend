import { Schema, model } from "mongoose";
const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
    },
    phone: {
        type: Number,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    friends: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    isVerified: {
        type: Boolean,
        default: false,
    },
    IsVerifiedToken: {
        type: String,
    },
    IsVerifiedTokenExpiry: {
        type: Date,
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordTokenExpiry: Date,
}, { timestamps: true });
const User = model("User", userSchema);
export default User;
