module.exports = errorHandler;

function errorHandler(err, req, res, next) {
    let statusCode;
    let message;

    switch (true) {
        case typeof err === 'string':
            // custom application error
            console.log(`errorHandler: ${JSON.stringify(err)}`);
            statusCode = err.toLowerCase().endsWith('not found') ? 404 : 400;
            message = err;
            break;
        case err.name === 'ValidationError':
            // mongoose validation error
            console.log(`ValidationError: ${JSON.stringify(err)}`);
            statusCode = 400;
            message = err.message;
            break;
        case err.name === 'UnauthorizedError':
            // jwt authentication error
            console.log(`Unauthorized error: ${JSON.stringify(err)}`);
            statusCode = 401;
            message = err.message ? err.message : 'Unauthorized Error';
            break;
        default:
            console.log(`errorHandler default`);
            statusCode = 500;
            message = err.message;
            break;
    }

    res.status(statusCode).render('errorHandler', { message });
}
