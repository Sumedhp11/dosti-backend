import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGO_URI!);
    console.log(db.connection.host);
    console.log("Db Connect Successfully");
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
};
export { connectDb };
