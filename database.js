const { MongoClient } = require('mongodb');
require('dotenv').config();

async function createDBClient() {
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);

    try {
        await client.connect();
    } catch (e) {
        console.error(e);
    }

    return client;
}

async function addFlashcards(client, flashCards) {
    const result = await client
        .db(process.env.DB_NAME)
        .collection(process.env.COLLECTION_NAME)
        .insertMany(flashCards);
    return result;
}

module.exports = {
    createDBClient,
    addFlashcards,
};
