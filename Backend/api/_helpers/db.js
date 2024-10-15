const config = require('../config/config');
const mongoose = require('mongoose');

const connectionOptions = {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
};

mongoose.connection.on('error', (err) => {
    console.error(`Error connecting to database: ${err}`);
});

mongoose.connection.on('connected', (err) => {
    console.log(`Connected to database.`);
});
mongoose.connect(process.env.MONGO_DB_URI || config.connectionString, connectionOptions);

mongoose.Promise = global.Promise;

module.exports = {
    User: require('../users/user.model'),
    RefreshToken: require('../users/refresh-token.model'),
    isValidId
};

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}
