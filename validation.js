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
    if (typeof response !== 'object') {
        console.error('Response is not an object:', response);
        return false;
    }
    if (!response.flashcards) {
        console.error(
            'Response does not have "flashcards" property:',
            response
        );
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

const isValidMessage = (message) => {
    if (typeof message !== 'object') {
        console.error('Message is not an object:', message);
        return false;
    }
    if (!message.inputText) {
        console.error('Message does not have "inputText" property:', message);
        return false;
    }
    if (typeof message.inputText !== 'string') {
        console.error('Message inputText is not a string:', message.inputText);
        return false;
    }
    return true;
};
module.exports = {
    isValidResponse,
    isValidMessage,
};
