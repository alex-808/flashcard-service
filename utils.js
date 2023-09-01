const retry = require('retry');
const { CustomError } = require('./errors');

const withRetries = ({ func, retries, err }) => {
    return async (...args) => {
        return new Promise((resolve, reject) => {
            const operation = retry.operation({ retries: retries });
            operation.attempt(async (currentAttempt) => {
                try {
                    const result = await func(...args);
                    resolve(result);
                } catch (err) {
                    if (operation.retry(err)) {
                        return;
                    }
                }
                reject(new CustomError(err, operation.mainError()));
            });
        });
    };
};

module.exports = {
    withRetries,
};
