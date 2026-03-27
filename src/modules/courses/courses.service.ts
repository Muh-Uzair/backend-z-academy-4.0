// import CourseModel from "./courses.model";
import AppError from "@/utils/appError.utils";
import { IUser } from "../users/users.model";
import CourseModel from "./courses.model";
import {
  validationCreateCourseType,
  validationGetCourseOnIdType,
} from "./courses.types";
import { createConversationService } from "../conversations/conversations.service";
import { ConversationType } from "../conversations/conversations.model";

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

  await newCourse.save()

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
