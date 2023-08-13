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

module.exports = {
    isValidResponse,
};
