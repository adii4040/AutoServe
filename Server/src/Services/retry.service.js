const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withRetry = async (fn, retries = 3, delayMs = 500) => {
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (attempt === retries) break;

            const backoff = delayMs * (2 ** attempt);
            await sleep(backoff);
        }
    }

    throw lastError;
};

export { withRetry };
