import nodemailer from "nodemailer";
import { env } from "./env";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.EMAIL_USER, // e.g., yourapp@gmail.com
    pass: env.EMAIL_PASS, // App Password (not regular password)
  },
});

// Test connection on startup (optional but recommended)
transporter.verify((error: unknown) => {
  if (error) {
    if (error instanceof Error) {
      console.error("Email transporter error:", error);
    } else {
      console.error("Email transporter error");
    }
  } else {
    console.log("Email transporter ready 🚀");
  }
});
