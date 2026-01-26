// models/course.model.ts
import { Document, Schema, model, Types } from "mongoose";

// Enum for course level
export enum CourseLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
}

// Enum for categories (5-8 categories as requested)
export enum CourseCategory {
  WEB_DEVELOPMENT = "Web Development",
  APP_DEVELOPMENT = "App Development",
  PROJECT_MANAGEMENT = "Project Management",
  DATA_SCIENCE = "Data Science",
  UI_UX_DESIGN = "UI/UX Design",
  MOBILE_DEVELOPMENT = "Mobile Development",
  DEVOPS = "DevOps",
  OTHER = "Other",
}

// Interface for TypeScript
export interface ICourse extends Document {
  title: string;
  description: string;
  instructor: Types.ObjectId; // reference to User
  price: number;
  level: CourseLevel;
  thumbnail: string;
  category: CourseCategory;
  createdAt: Date;
  updatedAt: Date;
}

// Course Schema
const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters long"],
      maxlength: [100, "Title cannot be more than 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [20, "Description must be at least 20 characters long"],
    },

    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User", // assuming your User model is named "User"
      required: [true, "Instructor is required"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      default: 0,
    },

    level: {
      type: String,
      enum: Object.values(CourseLevel),
      required: [true, "Level is required"],
    },

    thumbnail: {
      type: String,
      required: [true, "Thumbnail image URL is required"],
      // You can add validation for URL if you want
      // match: [/^https?:\/\//, "Please enter a valid URL"],
    },

    category: {
      type: String,
      enum: Object.values(CourseCategory),
      required: [true, "Category is required"],
    },
  },
  {
    timestamps: true, // automatically adds createdAt & updatedAt
  },
);

// Create and export the model
const Course = model<ICourse>("Course", courseSchema);

export default Course;
