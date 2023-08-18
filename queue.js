const {
    SQSClient,
    ReceiveMessageCommand,
    SendMessageCommand,
    DeleteMessageCommand,
} = require('@aws-sdk/client-sqs');
const retry = require('retry');

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
    return new Promise((resolve, reject) => {
        const receiveMessageCommand = new ReceiveMessageCommand({
            QueueUrl: queueURL,
            MaxNumberOfMessages: 1,
            WaitTimeSeconds: 20,
        });

        const operation = retry.operation();

        let res;
        operation.attempt(async (currentAttempt) => {
            try {
                res = await sqsClient.send(receiveMessageCommand);
                resolve(res);
            } catch (err) {
                if (operation.retry(err)) {
                    return;
                }
            }
            reject(operation.mainError());
        });
    });
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
        await deleteMessage(receiptHandle);
    } catch (err) {
        if (retries < 3) {
            await deleteMessageWithRetries(receiptHandle, retries + 1);
        } else {
            throw err;
        }
    }
};

module.exports = {
    getMessage,
    deleteMessageWithRetries,
};
