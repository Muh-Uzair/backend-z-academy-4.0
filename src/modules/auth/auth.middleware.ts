// src/modules/auth/auth.middleware.ts (new file if needed, or in services)
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import catchAsync from "@/utils/catchAsync";
import UserModel, { IUser } from "../users/users.model";

export const verifyAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken =
      req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
      res.status(401).json({ error: "Access token missing" });
      return;
    }

    const decoded = jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET) as {
      userId: string;
    };

    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;

    next();
  },
);

export const restrictTo = (...allowedRoles: string[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser | undefined;

    if (!user) {
      throw new Error("You are not logged in");
    }

    // Check if user role is in allowed roles
    if (!allowedRoles.includes(user.role)) {
      throw new Error("You do not have permission to perform this action");
    }

    next();
  });
};
