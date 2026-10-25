const serverless = require("serverless-http");
const app = require("../../src/app");

const handler = serverless(app, {
  binary: ["multipart/form-data", "application/pdf", "image/*", "*/*"],
});

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  // Normalize path if Netlify prefixes with /.netlify/functions/api
  if (event.path && event.path.startsWith("/.netlify/functions/api")) {
    event.path = event.path.replace("/.netlify/functions/api", "") || "/";
  }

  return await handler(event, context);
};
