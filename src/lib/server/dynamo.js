import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { env } from '$env/dynamic/private';

// Single shared DynamoDB document client. The document client lets us work with
// plain JS objects instead of DynamoDB's attribute-value wire format.
//
// Credentials come from env vars (see .env.example). On Vercel these are set in
// the project's Environment Variables; locally they live in .env (gitignored).
const client = new DynamoDBClient({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export const ddb = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

export const READING_LIST_TABLE = env.READING_LIST_TABLE ?? 'reading_list';
