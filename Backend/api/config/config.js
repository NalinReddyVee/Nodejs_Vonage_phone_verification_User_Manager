const config = {
    connectionString: process.env.MONGO_DB_URI,
    secret: process.env.APP_SECRET,
    env: process.env.ENVIRONMENT,
    maxApiRateLimit: process.env.MAX_API_RATE_LIMIT,
    vonage: {
        phone: process.env.VONAGE_PHONE_NUMBER,
        apiKey: process.env.VONAGE_API_KEY,
        apiSecret: process.env.VONAGE_API_SECRET
    }
};

module.exports = config;
