const {
    SQSClient,
    ReceiveMessageCommand,
    DeleteMessageCommand,
} = require('@aws-sdk/client-sqs');

const sqsClient = new SQSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const queueURL = process.env.SQS_QUEUE_URL;

const getMessage = async () => {
    const receiveMessageCommand = new ReceiveMessageCommand({
        QueueUrl: queueURL,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20,
    });
    const res = await sqsClient.send(receiveMessageCommand);
    return res;
};

const deleteMessage = async (ReceiptHandle) => {
    const deleteMessageCommand = new DeleteMessageCommand({
        QueueUrl: queueURL,
        ReceiptHandle,
    });
    const res = await sqsClient.send(deleteMessageCommand);
    return res;
};

module.exports = {
    getMessage,
    deleteMessage,
};
