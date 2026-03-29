import app from "./app.js";
import { env } from "@/config/env.js";
import SocketLib from "./lib/socket.lib.js";
import { createServer } from "node:http";
import { NextFunction, Response, Request } from "express";
import mongoose from "mongoose";

// mongodb connection
app.use((req: Request, res: Response, next: NextFunction) => {
  mongoose
    .connect(env.MONGO_DB_CONNECTION_STRING, {
      bufferCommands: false,
    })
    .then(() => {
      console.log("Database connection successful");
      next();
    })
    .catch((err) => {
      console.error("Database connection error:", err);
      res.status(500).json({ message: "Error connecting to mongodb" });
    });
});

// 1 : create a http server
const httpServer = createServer(app);

// 2 : initialize socket lib and attach it to the http server
const socketLib = new SocketLib();
socketLib.io.attach(httpServer);
socketLib.initListeners();

// 3 : make the server listen
const PORT: number = Number(env.PORT) || 4000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});
