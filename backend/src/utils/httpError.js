// Error that carries an HTTP status, so the central error handler can reply correctly.
const httpError = (status, message) => Object.assign(new Error(message), { status });

module.exports = httpError;
