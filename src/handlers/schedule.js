import AWS from "aws-sdk";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpErrorHandler from "@middy/http-error-handler";
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function schedule(event, context) {
  const { id, daysOff } = event.body;
  const now = new Date();

  const monthSchedule = {
    id,
    daysOff,
    createdAt: now.toISOString(),
  };

  try {
    await dynamodb
      .put({
        TableName: process.env.SCHEDULE_TABLE_NAME,
        Item: monthSchedule,
      })
      .promise();
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 201,
    body: JSON.stringify(monthSchedule),
  };
}

export const handler = middy(schedule)
  .use(httpJsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());
