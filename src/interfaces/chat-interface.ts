import { Schema } from "mongoose";

export interface ChatSchemaInterface {
  name: string;
  isGroupChat: boolean;
  creator: Schema.Types.ObjectId;
  members: Schema.Types.ObjectId[];
}
