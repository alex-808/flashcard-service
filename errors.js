class CustomError extends Error {
    constructor(message, details) {
        super(message);
        this.details = details;
    }
}

const INVALID_MESSAGE = 'Invalid message from queue';
const INVALID_FLASHCARD_RESPONSE = 'Invalid flashcard response from API';
const TOO_FEW_FLASHCARDS = 'Response has too few flashcards';
const UNABLE_TO_DELETE_MESSAGE = 'Unable to delete message';
const NO_MESSAGES_IN_QUEUE = 'No messages in queue';
const FLASHCARD_GENERATION_FAILED = 'Flashcard generation failed';
const UNABLE_TO_RETRIEVE_MESSAGES = 'Unable to retrieve messages';
const UNABLE_TO_CONNECT_TO_DB = 'Unable to connect to database';
const UNABLE_TO_ADD_FLASHCARDS_TO_DB = 'Unable to add flashcards to database';

module.exports = {
    CustomError: CustomError,
    INVALID_MESSAGE: INVALID_MESSAGE,
    INVALID_FLASHCARD_RESPONSE: INVALID_FLASHCARD_RESPONSE,
    TOO_FEW_FLASHCARDS: TOO_FEW_FLASHCARDS,
    UNABLE_TO_DELETE_MESSAGE: UNABLE_TO_DELETE_MESSAGE,
    NO_MESSAGES_IN_QUEUE: NO_MESSAGES_IN_QUEUE,
    FLASHCARD_GENERATION_FAILED: FLASHCARD_GENERATION_FAILED,
    UNABLE_TO_RETRIEVE_MESSAGES: UNABLE_TO_RETRIEVE_MESSAGES,
    UNABLE_TO_CONNECT_TO_DB: UNABLE_TO_CONNECT_TO_DB,
    UNABLE_TO_ADD_FLASHCARDS_TO_DB: UNABLE_TO_ADD_FLASHCARDS_TO_DB,
};
