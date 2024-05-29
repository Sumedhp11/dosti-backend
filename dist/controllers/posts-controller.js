import { ErrorHandler } from "../utils/ErrorClass.js";
import Posts from "../models/posts-models.js";
import { uploadFilesToCloudinary } from "../utils/cloudinary.js";
const AddNewPost = async (req, res, next) => {
    try {
        const { caption } = req.body;
        const file = req.file;
        if (!caption || !file)
            return next(new ErrorHandler("Please Provide Content And Caption", 400));
        const contentLink = await uploadFilesToCloudinary([file]);
        const newPosts = new Posts({
            caption,
            content: contentLink[0].public_id,
            likes: 0,
            comments: [],
            userId: req.userId,
        });
        const newsavedPost = await newPosts.save();
        return res.status(200).json({
            status: true,
            message: "New Post Added Successfully",
            data: newsavedPost,
        });
    }
    catch (error) {
        console.log(error);
        return next(new ErrorHandler("Internal Server Error", 500));
    }
};
export { AddNewPost };
