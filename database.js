const { MongoClient } = require('mongodb');
const retry = require('retry');
const {
    CustomError,
    UNABLE_TO_CONNECT_TO_DB,
    UNABLE_TO_ADD_FLASHCARDS_TO_DB,
} = require('./errors');
require('dotenv').config();

async function createDBClient() {
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);

    return new Promise((resolve, reject) => {
        const operation = retry.operation({ retries: 10 });
        operation.attempt(async (currentAttempt) => {
            try {
                await client.connect();
                resolve(client);
            } catch (err) {
                if (operation.retry(err)) {
                    return;
                }
            }
            reject(
                new CustomError(UNABLE_TO_CONNECT_TO_DB, operation.mainError())
            );
        });
    });
}

async function addFlashcards(client, flashCards) {
    const result = await client
        .db(process.env.DB_NAME)
        .collection(process.env.COLLECTION_NAME)
        .insertMany(flashCards);
    return result;
}

async function addFlashcardsWithRetries(client, flashCards) {
    return new Promise((resolve, reject) => {
        const operation = retry.operation({ retries: 5 });
        operation.attempt(async (currentAttempt) => {
            try {
                const result = await addFlashcards(client, flashCards);
                resolve(result);
            } catch (err) {
                if (operation.retry(err)) {
                    return;
                }
            }
            reject(
                new CustomError(
                    UNABLE_TO_ADD_FLASHCARDS_TO_DB,
                    operation.mainError()
                )
            );
        });
    });
}

module.exports = {
    createDBClient,
    addFlashcardsWithRetries,
};
