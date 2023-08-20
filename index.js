require('dotenv').config();
const { Configuration, OpenAIApi } = require('openai');
const { getMessage, deleteMessageWithRetries } = require('./queue');
const { isValidFlashcardResponse, isValidMessage } = require('./validation');
const retry = require('retry');

const configuration = new Configuration({
    apiKey: process.env.AI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const print_flashcards = {
    name: 'print_flashcards',
    description: 'Print an array of flashcard objects',
    parameters: {
        type: 'object',
        properties: {
            length: {
                type: 'number',
                description: 'length of the flashcards array',
            },
            flashcards: {
                type: 'array',
                description: 'An array of one or more flashcards',
                items: {
                    type: 'object',
                    properties: {
                        front: {
                            type: 'string',
                            description:
                                'Front content of a flashcard containing a question. Quotation marks should be escaped with a forward slash.',
                        },
                        back: {
                            type: 'string',
                            description:
                                'Back content of a flashcard containing the answer to the question. Quotation marks should be escaped with a forward slash.',
                        },
                    },
                },
            },
        },
    },
};

const promptBuilder = ({
    cardCount,
    topics,
    keywords,
    example,
    difficulty,
}) => {
    let prompt = `The user will provide you with a set of text which they would like to print this number of flashcards: ${cardCount}. `;
    if (topics) {
        prompt += `They have indicated the topic(s) they would like the flashcards to be about are the following: ${topics.join(
            ', '
        )}. `;
    }
    if (keywords) {
        prompt += `They have indicated that the keyword(s) they would like some flashcards to be about are the following: ${keywords.join(
            ', '
        )}. `;
    }
    if (example) {
        prompt += `They have provided an example question and answer to help guide the generation of cards. Here is the example front content of the card: "${example.front}" and here is the example back content of the card: "${example.back}". `;
    }
    if (difficulty) {
        `The user has indicated that they would like the difficulty level of the cards to be of ${difficulty} difficulty. `;
    }
    return prompt;
};

const generate = async (inputText, prompt) => {
    const chatCompletion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: prompt,
            },
            {
                role: 'user',
                content: `${inputText}`,
            },
        ],
        functions: [print_flashcards],
        max_tokens: 1000,
    });
    const { arguments } = chatCompletion.data.choices[0].message.function_call;
    return arguments;
};

const generateWithRetries = async (inputText, prompt) => {
    return new Promise((resolve, reject) => {
        const operation = retry.operation({
            retries: 5,
        });
        operation.attempt(async (currentAttempt) => {
            try {
                const response = await generate(inputText, prompt);
                resolve(response);
            } catch (err) {
                if (operation.retry(err)) {
                    return;
                }
            }
            reject(operation.mainError());
        });
    });
};

const consume = async (msgHandler, errorHandler) => {
    let message = await getMessage();
    if (!message) {
        console.log('No messages in queue');
        consume(msgHandler, errorHandler);
    } else {
        try {
            await msgHandler(message);
        } catch (err) {
            errorHandler(err);
        }
        consume(msgHandler, errorHandler);
    }
};

const messageHandler = async (msg) => {
    if (!isValidMessage(msg)) throw new Error('Invalid message from queue');
    const msgBody = JSON.parse(msg.Body);
    const prompt = promptBuilder(msgBody);

    let flashcards;
    try {
        const response = await generateWithRetries(msgBody.inputText, prompt);
        if (!isValidFlashcardResponse(response)) {
            throw new Error('Invalid flashcard response from API');
        }
        flashcards = JSON.parse(response).flashcards;

        if (flashcards.length < msgBody.cardCount) {
            throw new Error('Response has too few flashcards');
        }
        if (flashcards.length > msgBody.cardCount) {
            flashcards = flashcards.slice(0, msgBody.cardCount);
        }
    } catch (err) {
        throw new Error(`Flashcard generation failed: ${err.message}`);
    }

    try {
        await deleteMessageWithRetries(msg.ReceiptHandle);
    } catch (err) {
        throw new Error(`Unable to delete message: ${err}`);
    }
    // TODO send flashcards to database
    console.log(flashcards);
};

const errorHandler = (err) => {
    console.error('ERROR: ', err.message);
};

consume(messageHandler, errorHandler);
