const {
    SQSClient,
    ReceiveMessageCommand,
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

const getMessage = async () => {
    return new Promise((resolve, reject) => {
        const receiveMessageCommand = new ReceiveMessageCommand({
            QueueUrl: queueURL,
            MaxNumberOfMessages: 1,
            WaitTimeSeconds: 2,
        });

        const operation = retry.operation({
            retries: 7,
        });

        let res;
        operation.attempt(async (currentAttempt) => {
            try {
                res = await sqsClient.send(receiveMessageCommand);
                resolve(res.Messages ? res.Messages[0] : null);
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

const deleteMessageWithRetries = async (receiptHandle) => {
    return new Promise((resolve, reject) => {
        const operation = retry.operation({
            retries: 5,
        });

        operation.attempt(async (currentAttempt) => {
            try {
                await deleteMessage(receiptHandle);
                resolve();
            } catch (err) {
                if (operation.retry(err)) {
                    return;
                }
            }
            reject(operation.mainError());
        });
    });
};

module.exports = {
    getMessage,
    deleteMessageWithRetries,
};
