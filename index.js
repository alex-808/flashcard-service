require('dotenv').config();

const { Configuration, OpenAIApi } = require('openai');

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
            flashcards: {
                type: 'array',
                description: 'An array of flashcards',
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

const promptBuilder = (cardCount, topics, keywords, example, difficulty) => {
    let prompt = `The user will provide you with a set of text which they would like to print ${cardCount} flashcard(s). `;
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
    // Add support for topics, keywords, example flashcard and difficulty
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
    });
    const { arguments } = chatCompletion.data.choices[0].message.function_call;
    const { usage } = chatCompletion.data;
    console.log(chatCompletion);
    return arguments;
};

const input =
    'In computing, plain text is a loose term for data (e.g. file contents) that represent only characters of readable material but not its graphical representation nor other objects (floating-point numbers, images, etc.). It may also include a limited number of "whitespace" characters that affect simple arrangement of text, such as spaces, line breaks, or tabulation characters. Plain text is different from formatted text, where style information is included; from structured text, where structural parts of the document such as paragraphs, sections, and the like are identified; and from binary files in which some portions must be interpreted as binary objects (encoded integers, real numbers, images, etc.) The term is sometimes used quite loosely, to mean files that contain only "readable" content (or just files with nothing that the speaker does not prefer). For example, that could exclude any indication of fonts or layout (such as markup, markdown, or even tabs); characters such as curly quotes, non-breaking spaces, soft hyphens, em dashes, and/or ligatures; or other things. In principle, plain text can be in any encoding, but occasionally the term is taken to imply ASCII. As Unicode-based encodings such as UTF-8 and UTF-16 become more common, that usage may be shrinking. Plain text is also sometimes used only to exclude "binary" files: those in which at least some parts of the file cannot be correctly interpreted via the character encoding in effect. For example, a file or string consisting of "hello" (in any encoding), following by 4 bytes that express a binary integer that is not a character, is a binary file. Converting a plain text file to a different character encoding does not change the meaning of the text, as long as the correct character encoding is used. However, converting a binary file to a different format may alter the interpretation of the non-textual data. According to The Unicode Standard: "Plain text is a pure sequence of character codes; plain Un-encoded text is therefore a sequence of Unicode character codes.In contrast, styled text, also known as rich text, is any text representation containing plain text plus added information such as a language identifier, font size, color, hypertext links, and so on. SGML, RTF, HTML, XML, and TeX are examples of rich text fully represented as plain text streams, interspersing plain text data with sequences of characters that represent the additional data structures."';

const prompt = promptBuilder(3);

const isValidCard = (card) => {
    return (
        typeof card === 'object' &&
        card.front &&
        typeof card.front === 'string' &&
        card.back &&
        typeof card.back === 'string'
    );
};

const isValidResponse = (response) => {
    if (typeof response !== 'object' || !response.flashcards) {
        console.error('Invalid response');
        return false;
    }
    const { flashcards } = response;

    if (!Array.isArray(flashcards)) {
        console.error('Flashcards is not an array');
        return false;
    }

    for (let card of flashcards) {
        if (!isValidCard(card)) {
            console.error('Invalid card:', card);
            return false;
        }
    }
    return true;
};

const runTest = async (input, prompt) => {
    for (let i = 0; i < 1; i++) {
        const response = await generate(input, prompt);
        console.log(i);
        console.log(response);
        let json;
        try {
            json = JSON.parse(response);
        } catch (err) {
            console.error(err);
        }

        const result = isValidResponse(json);
        console.log(result);
    }
};
runTest(input, prompt);

// TODO get count of tokens used by request
// TODO should report failure rate
// TODO too many cards are being returned if requested cards < 3

// Returning a flashcard with quotation marks may cause issues parsing json
// "front": "What does it mean when plain text is referred to as "loose"?",
// check response status
// handle rate limiting
// implement max tokens
