import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sendMessageToSQS = async (payload) => {
  try {
    const SQSURL = process.env.AWS_SQS_QUEUE_URL;
    const client = new SQSClient({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    if (!SQSURL || !client) {
      throw new Error("Required config parameters missing for aws");
    }
    const message = new SendMessageCommand({
      QueueUrl: SQSURL,
      MessageBody: JSON.stringify(payload),
    });
    await client.send(message);
  } catch (err) {
    throw new Error("Failed to send message to sqs reason -->" + err.message);
  }
};

export default sendMessageToSQS;
