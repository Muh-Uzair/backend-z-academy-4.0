import { env } from "@/config/env";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/config/s3.config";
import { validationPutObjectCommandType } from "./s3.types";

// FUNCTION
export const putObjectCommandService = async (
  reqBody: validationPutObjectCommandType,
) => {
  // deal with put command
  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: reqBody.key,
    ContentType: reqBody.fileType,
  });

  // generate presigned url
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  // return it
  return {
    signedUrl: url,
  };
};
