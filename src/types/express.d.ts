// src/types/express.d.ts

import { IUser } from "@/modules/users/users.model";

declare module "express" {
  interface Request {
    user?: IUser;
  }
}
