require('dotenv').config();
const examples = require('./example');
const { Configuration, OpenAIApi } = require('openai');
const { getMessage, deleteMessage, sendToDLQ } = require('./queue');
const { isValidResponse } = require('./validation');

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
    try {
        const chatCompletion = await openai.createChatCompletion({
            model: 'gpt-3.5-turb',
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
        const { arguments } =
            chatCompletion.data.choices[0].message.function_call;
        return arguments;
    } catch (err) {
        console.error(err);
    }
};

const generateFromQueue = async () => {
    let data;
    try {
        data = await getMessage();
    } catch (err) {
        console.error(err);
    }
    console.log('called');
    console.log(data);
    // TODO if status code is not 200, retry
    if (!data.Messages) {
        console.log('No messages in queue');
        generateFromQueue();
        return;
    }

    let message = data.Messages[0];
    try {
        message = JSON.parse(message.Body);
    } catch (err) {
        console.error(err);
        sendToDLQ(message);
        generateFromQueue();
        return;
    }

    const prompt = promptBuilder(message);

    let flashcards = await generate(message.inputText, prompt);

    try {
        flashcards = JSON.parse(flashcards);
    } catch (err) {
        console.error(err);
        sendToDLQ(message);
        generateFromQueue();
        return;
    }
    const isValid = isValidResponse(flashcards);
    if (!isValid) {
        console.error('Invalid flashcard response from API');
        sendToDLQ(message);
        generateFromQueue();
        return;
    }
    const res = await deleteMessage(data.Messages[0].ReceiptHandle);
    if (res.$metadata.httpStatusCode !== 200) {
        // TODO add retry logic
    }
    console.log(res);
    generateFromQueue();
};

generateFromQueue();

// TODO set up proper error handling
// TODO Validate response length
// What do we do if the response has too many flashcards?
// What do we do if the response has too few flashcards?
// TODO add retry logic
// TODO set up proper logging
// TODO Add rate limiting

// Failure points:
// 1. Invalid response from API
// 2. Invalid response from queue
// 3. Invalid response from validation
// 4. Invalid response from queue deletion
// 5. Invalid response from queue message retrieval
