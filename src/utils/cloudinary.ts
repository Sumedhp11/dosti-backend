import { v2 as cloudinary } from "cloudinary";
import { v4 as uuid } from "uuid";
export const getBase64 = (file: any) =>
  `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
const uploadFilesToCloudinary = async (files: any = []) => {
  const uploadPromises = files.map((file: any) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        getBase64(file),
        { resource_type: "auto", public_id: uuid() },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    });
  });
  try {
    const results = await Promise.all(uploadPromises);
    const formattedResult = results.map((result: any) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));
    return formattedResult;
  } catch (error) {
    console.log(error);
    throw new Error("Error Uploading Files to cloudinary");
  }
};

export { uploadFilesToCloudinary };
