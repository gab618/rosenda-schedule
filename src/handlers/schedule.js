import AWS from "aws-sdk";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpErrorHandler from "@middy/http-error-handler";
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function schedule(event, context) {
  const { id, daysOff, password } = event.body;

  if (password !== process.env.SECRET.trim()) {
    return {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Headers":
          "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
        "Access-Control-Allow-Origin": "*",
        "X-Requested-With": "*",
      },
      statusCode: 401,
      body: JSON.stringify({ message: "Senha incorreta!" }),
    };
  }

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
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Headers":
        "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      "Access-Control-Allow-Methods": "OPTIONS,POST",
      "Access-Control-Allow-Origin": "*",
      "X-Requested-With": "*",
    },
    body: JSON.stringify(monthSchedule),
  };
}

export const handler = middy(schedule)
  .use(httpJsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());
