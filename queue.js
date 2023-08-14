const {
    SQSClient,
    ReceiveMessageCommand,
    SendMessageCommand,
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
const dlqURL = process.env.SQS_DLQ_URL;

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

const sendToDLQ = async (message) => {
    console.log('Sending to DLQ, message:', message);
    try {
        await deleteMessage(message.ReceiptHandle);
    } catch (err) {
        console.error(err);
    }

    const sendMessageCommand = new SendMessageCommand({
        QueueUrl: process.env.SQS_DLQ_URL,
        MessageBody: JSON.stringify(message),
    });

    try {
        await sqsClient.send(sendMessageCommand);
    } catch (err) {
        console.error(err);
    }
};
module.exports = {
    getMessage,
    deleteMessage,
    sendToDLQ,
};
