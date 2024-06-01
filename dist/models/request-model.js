import mongoose, { Schema } from "mongoose";
const RequestSchema = new mongoose.Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        default: "pending",
        enum: ["pending", "accepted", "rejected"],
    },
}, { timestamps: true });
const Request = mongoose.model("Request", RequestSchema);
export default Request;
