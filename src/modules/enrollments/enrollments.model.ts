// models/enrollment.model.ts
import { Document, Schema, model, Types } from "mongoose";

// Enum for enrollment status
export enum EnrollmentStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  DROPPED = "dropped",
}

// Enum for payment status
export enum PaymentStatus {
  PAID = "paid",
  PENDING = "pending",
  REFUNDED = "refunded",
}

// Interface for TypeScript
export interface IEnrollment extends Document {
  student: Types.ObjectId;
  course: Types.ObjectId;
  instructor: Types.ObjectId;

  enrollmentDate: Date;
  status: EnrollmentStatus;
  paymentStatus: PaymentStatus;

  amountPaid: number;
  originalPrice: number;

  createdAt: Date;
  updatedAt: Date;
}

// Enrollment Schema
const enrollmentSchema = new Schema<IEnrollment>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },

    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },

    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Instructor is required"],
    },

    enrollmentDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: Object.values(EnrollmentStatus),
      default: EnrollmentStatus.ACTIVE,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PAID,
      required: true,
    },

    amountPaid: {
      type: Number,
      required: [true, "Amount paid is required"],
      min: [0, "Amount cannot be negative"],
    },

    originalPrice: {
      type: Number,
      required: [true, "Original price is required"],
      min: [0, "Original price cannot be negative"],
    },
  },
  {
    timestamps: true, // automatically handles createdAt & updatedAt
  },
);

// Optional: Compound index for faster queries (e.g., student's enrolled courses)
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true }); // prevent double enrollment
enrollmentSchema.index({ instructor: 1, status: 1 }); // for instructor dashboard stats

const Enrollment = model<IEnrollment>("Enrollment", enrollmentSchema);

export default Enrollment;
