import { Schema } from "mongoose";

export interface UserSchemaInterface {
  fullName: string;
  username: string;
  phone: number;
  password: string;
  email: string;
  avatar: string;
  friends: Schema.Types.ObjectId[];
  isVerified: boolean;
  IsVerifiedToken?: string;
  IsVerifiedTokenExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordTokenExpiry?: Date;
}
