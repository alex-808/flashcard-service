const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');
require('dotenv').config();
const { example2 } = require('./example');

const sqsClient = new SQSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const queueURL = process.env.SQS_QUEUE_URL;

class flashcardRequest {
    constructor(inputText, cardCount, topics, keywords, example, difficulty) {
        this.inputText = inputText;
        this.cardCount = cardCount;
        this.topics = topics;
        this.keywords = keywords;
        this.example = example;
        this.difficulty = difficulty;
    }
}

let messageBody = new flashcardRequest(example2, 5);
messageBody = JSON.stringify(messageBody);

const sendMessageCommand = new SendMessageCommand({
    MessageBody: messageBody,
    QueueUrl: queueURL,
});

sqsClient.send(sendMessageCommand).then((response) => {
    console.log('Queue sendMessage response:', response);
});
