import { IncomingMessage, ServerResponse } from "http";
import { Socket } from "socket.io";
import User from "../models/user-model.js";
import { Response } from "express";
import { UserSchemaInterface } from "./user-interface.js";

interface IncomingMessageWithCookies extends IncomingMessage {
  cookies?: { [key: string]: string };
}

export interface AuthenticatedSocket extends Socket {
  request: IncomingMessageWithCookies;
  user?: UserSchemaInterface;
}
