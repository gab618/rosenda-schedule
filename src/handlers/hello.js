import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function hello(event, context) {
  const now = new Date();

  const auction = {
    id: uuid(),
    status: "teste",
    createdAt: now.toISOString(),
  };

  await dynamodb
    .put({
      TableName: "ScheduleTable",
      Item: auction,
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from https://codingly.io" }),
  };
}

export const handler = hello;
