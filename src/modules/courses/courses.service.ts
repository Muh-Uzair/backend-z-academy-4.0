// import CourseModel from "./courses.model";
import AppError from "@/utils/appError.utils";
import { IUser } from "../users/users.model";
import CourseModel from "./courses.model";
import {
  validationCreateCourseType,
  validationGetCourseOnIdType,
  validationGetCourseStudentInstructorListType,
} from "./courses.types";
import { createConversationService } from "../conversations/conversations.service";
import { ConversationType } from "../conversations/conversations.model";
import EnrollmentModel from "../enrollments/enrollments.model";
import { Types } from "mongoose";
import { Request } from "express";

// FUNCTION
export const createCourseService = async (
  reqBody: validationCreateCourseType,
  user: IUser,
) => {
  // check if the course id existing
  const existingCourse = await CourseModel.findOne({
    title: reqBody.title.trim(),
    instructor: user?._id,
  });

  if (existingCourse) {
    throw new AppError("You already have a course with this title", 409);
  }

  // create course
  const newCourse = await CourseModel.create({
    ...reqBody,
    instructor: user?._id,
  });

  if (!newCourse) {
    throw new AppError("Something went wrong while creating course", 500);
  }

  // create an conversation for this course
  const newConversation = await createConversationService({
    conversationType: ConversationType.COURSE_PUBLIC,
    course: newCourse?._id,
  });

  if (!newConversation) {
    throw new AppError("Something went wrong while creating conversation", 500);
  }

  // create the reference of conversation in course
  newCourse.conversation = newConversation.conversation._id;

  await newCourse.save();

  return {
    course: newCourse,
  };
};

// FUNCTION
export const getAllCoursesService = async () => {
  const courses = await CourseModel.find({}).populate(
    "instructor",
    "_id, fullName",
  );

  return { courses };
};

// FUNCTION
export const getCourseOnIdService = async (
  reqParams: validationGetCourseOnIdType,
) => {
  const { id } = reqParams;

  const course = await CourseModel.findById(id).populate(
    "instructor",
    "_id, fullName",
  );

  if (!course) {
    throw new AppError("No course found with that ID", 404);
  }

  return { course };
};

// FUNCTION
export const getCourseStudentInstructorListService = async (
  req: Request,
  reqParams: validationGetCourseStudentInstructorListType,
) => {
  const { course } = reqParams;
  const user = req.user;

  const pipeline = [
    {
      $match: { course: new Types.ObjectId(course) },
    },
    {
      $lookup: {
        from: "users",
        localField: "student",
        foreignField: "_id",
        as: "student",
      },
    },
    {
      $unwind: {
        path: "$student",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "instructor",
        foreignField: "_id",
        as: "instructor",
      },
    },
    {
      $unwind: {
        path: "$instructor",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$course",
        students: {
          $push: {
            _id: "$student._id",
            fullName: "$student.fullName",
            role: "$student.role",
          },
        },
        instructor: {
          $first: {
            _id: "$instructor._id",
            fullName: "$instructor.fullName",
            role: "$instructor.role",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        result: {
          $concatArrays: [["$instructor"], "$students"],
        },
      },
    },
    {
      $project: {
        result: {
          $filter: {
            input: "$result",
            as: "item",
            cond: {
              $ne: ["$$item._id", new Types.ObjectId(user?._id)],
            },
          },
        },
      },
    },
  ];

  const courseStudentInstructorList = await EnrollmentModel.aggregate(pipeline);

  return {
    courseStudentInstructorList: courseStudentInstructorList[0].result,
  };
};
