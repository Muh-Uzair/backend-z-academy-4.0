import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { env } from "@/config/env";
import { IUser } from "../users/users.model";

export const generateAccessToken = (user: IUser): string => {
  const expiresIn = env.ACCESS_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"];

  return jwt.sign({ userId: user._id }, env.ACCESS_TOKEN_SECRET, {
    expiresIn,
  });
};

export const generateRefreshToken = (user: IUser): string => {
  const expiresIn = env.REFRESH_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"];

  return jwt.sign({ userId: user._id }, env.REFRESH_TOKEN_SECRET, {
    expiresIn,
  });
};

export const storeRefreshToken = async (
  user: IUser,
  refreshToken: string,
): Promise<void> => {
  const hashedToken: string = await bcrypt.hash(refreshToken, 10);
  user.refreshToken = hashedToken;
  await user.save();
};
