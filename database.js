const { MongoClient } = require('mongodb');
const {
    UNABLE_TO_CONNECT_TO_DB,
    UNABLE_TO_ADD_FLASHCARDS_TO_DB,
} = require('./errors');
const { withRetries } = require('./utils');
require('dotenv').config();

async function createDBClient() {
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);
    await client.connect();
    return client;
}

const createDBClientWithRetries = withRetries({
    func: createDBClient,
    retries: 10,
    err: UNABLE_TO_CONNECT_TO_DB,
});

async function addFlashcards(client, flashCards) {
    const result = await client
        .db(process.env.DB_NAME)
        .collection(process.env.COLLECTION_NAME)
        .insertMany(flashCards);
    return result;
}

const addFlashcardsWithRetries = withRetries({
    func: addFlashcards,
    retries: 5,
    err: UNABLE_TO_ADD_FLASHCARDS_TO_DB,
});

module.exports = {
    createDBClientWithRetries,
    addFlashcardsWithRetries,
};
