import app from "./app.js";
import { env } from "@/config/env.js";
import SocketLib from "./lib/socket.lib.js";
import { createServer } from "node:http";
import mongoose from "mongoose";

const main = async () => {
  try {
    await mongoose.connect(env.MONGO_DB_CONNECTION_STRING, {
      bufferCommands: false,
    });

    console.log("Database connection successful");

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
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }
};

main();
