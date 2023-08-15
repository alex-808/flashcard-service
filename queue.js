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

const deleteMessage = async (receiptHandle) => {
    const deleteMessageCommand = new DeleteMessageCommand({
        QueueUrl: queueURL,
        ReceiptHandle: receiptHandle,
    });
    const res = await sqsClient.send(deleteMessageCommand);
    return res;
};

const deleteMessageWithRetries = async (receiptHandle, retries = 0) => {
    try {
        deleteMessage(receiptHandle);
    } catch (err) {
        if (retries < 3) {
            console.error(err);
            console.log('Retrying...');
            deleteMessageWithRetries(receiptHandle, retries + 1);
        } else {
            console.error(err);
            console.error('Unable to delete message');
        }
    }
};

const sendToDLQ = async (message) => {
    const sendMessageCommand = new SendMessageCommand({
        QueueUrl: dlqURL,
        MessageBody: JSON.stringify(message),
    });

    try {
        await sqsClient.send(sendMessageCommand);
    } catch (err) {
        console.error(err);
        return;
    }

    try {
        await deleteMessageWithRetries(message.ReceiptHandle);
    } catch (err) {
        console.error(err);
    }
};

module.exports = {
    getMessage,
    deleteMessage,
    deleteMessageWithRetries,
    sendToDLQ,
};
