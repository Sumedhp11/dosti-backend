import { Schema } from "mongoose";

export interface ChatSchemaInterface {
  name: string;
  isGroupChat: boolean;
  creator: Schema.Types.ObjectId;
  members: [
    {
      _id: Schema.Types.ObjectId;
      username: string;
      avatar: string;
    }
  ];
}
