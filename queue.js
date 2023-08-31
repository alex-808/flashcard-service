const {
    SQSClient,
    ReceiveMessageCommand,
    DeleteMessageCommand,
} = require('@aws-sdk/client-sqs');
const {
    UNABLE_TO_DELETE_MESSAGE,
    UNABLE_TO_RETRIEVE_MESSAGES,
} = require('./errors');
const { withRetries } = require('./utils');

const sqsClient = new SQSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const queueURL = process.env.SQS_QUEUE_URL;
const retries = 5;

const getMessage = async () => {
    const receiveMessageCommand = new ReceiveMessageCommand({
        QueueUrl: queueURL,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 2,
    });
    const res = await sqsClient.send(receiveMessageCommand);
    return res.Messages ? res.Messages[0] : null;
};

const getMessageWithRetries = withRetries({
    func: getMessage,
    retries: retries,
    err: UNABLE_TO_RETRIEVE_MESSAGES,
});

const deleteMessage = async (receiptHandle) => {
    const deleteMessageCommand = new DeleteMessageCommand({
        QueueUrl: queueURL,
        ReceiptHandle: receiptHandle,
    });
    const res = await sqsClient.send(deleteMessageCommand);
    return res;
};

const deleteMessageWithRetries = withRetries({
    func: deleteMessage,
    retries: retries,
    err: UNABLE_TO_DELETE_MESSAGE,
});

module.exports = {
    getMessageWithRetries,
    deleteMessageWithRetries,
};
