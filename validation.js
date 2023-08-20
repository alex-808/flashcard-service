const isValidCard = (card) => {
    return (
        typeof card === 'object' &&
        card.front &&
        typeof card.front === 'string' &&
        card.back &&
        typeof card.back === 'string'
    );
};

const isValidFlashcardResponse = (response) => {
    try {
        response = JSON.parse(response);
    } catch (err) {
        return false;
    }

    if (typeof response !== 'object') {
        return false;
    }
    if (!response.flashcards) {
        console.error(response);
        return false;
    }

    const { flashcards } = response;

    if (!Array.isArray(flashcards)) {
        return false;
    }

    for (let card of flashcards) {
        if (!isValidCard(card)) {
            return false;
        }
    }
    return true;
};

const isValidMessage = (msg) => {
    try {
        msgBody = JSON.parse(msg.Body);
    } catch (err) {
        console.error(err);
        return false;
    }
    if (typeof msgBody !== 'object') {
        return false;
    }
    if (!msgBody.inputText) {
        return false;
    }
    if (typeof msgBody.inputText !== 'string') {
        return false;
    }
    return true;
};
module.exports = {
    isValidFlashcardResponse,
    isValidMessage,
};
