require('dotenv').config();
const { Configuration, OpenAIApi } = require('openai');
const { getMessage, deleteMessageWithRetries, sendToDLQ } = require('./queue');
const { isValidResponse, isValidMessage } = require('./validation');

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
const print_flashcard = {
    name: 'print_flashcard',
    description: 'Print a flashcard object',
    parameters: {
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
        functions: [print_flashcard, print_flashcards],
        max_tokens: 1000,
    });
    const { arguments } = chatCompletion.data.choices[0].message.function_call;
    return arguments;
};

const generateWithRetries = async (inputText, prompt, retries = 0) => {
    try {
        return await generate(inputText, prompt);
    } catch (err) {
        if (retries < 3) {
            return await generateWithRetries(inputText, prompt, retries + 1);
        } else {
            throw err;
        }
    }
};

const generateFromQueue = async () => {
    let data;
    try {
        data = await getMessage();
    } catch (err) {
        console.error('Unable to get message from queue:', err);
        setTimeout(generateFromQueue, 10000);
        return;
    }

    if (!data.Messages) {
        console.error('No messages in queue');
        generateFromQueue();
        return;
    }

    let message = data.Messages[0];
    let messageBody;
    try {
        messageBody = JSON.parse(message.Body);
        if (!isValidMessage(messageBody)) {
            throw new Error('Invalid message from queue');
        }
    } catch (err) {
        console.error(err);
        sendToDLQ(message);
        generateFromQueue();
        return;
    }

    const prompt = promptBuilder(messageBody);

    let flashcards;
    try {
        flashcards = await generateWithRetries(messageBody.inputText, prompt);
        flashcards = JSON.parse(flashcards);
        if (!isValidResponse(flashcards)) {
            throw new Error('Invalid flashcard response from API');
        }
        if (flashcards.length < messageBody.cardCount) {
            throw new Error('Response has too few flashcards');
        }
        if (flashcards.length > messageBody.cardCount) {
            flashcards = flashcards.slice(0, messageBody.cardCount);
        }
    } catch (err) {
        console.error('Flashcard generation failed:', err);
        generateFromQueue();
        return;
    }

    try {
        await deleteMessageWithRetries(message.ReceiptHandle);
    } catch (err) {
        console.error('Unable to delete message:', err);
        generateFromQueue();
        return;
    }
    // TODO send flashcards to database
    console.log(flashcards);
    generateFromQueue();
};

generateFromQueue();

// TODO Validate response length
// What do we do if the response has too many flashcards?
// Return all the flashcards
// What do we do if the response has too few flashcards?
// Retry the request

// 3. Invalid response from queue deletion
// Should be retried
