const multer = require("multer");

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  console.error(`[${req.method} ${req.originalUrl}] ${error.message}`);

  if (error instanceof multer.MulterError) {
    const message = error.code === "LIMIT_FILE_SIZE"
      ? `PDF exceeds the ${process.env.MAX_UPLOAD_MB || 15} MB upload limit.`
      : error.message;
    return res.status(400).json({ success: false, message });
  }

  const status = Number(error.status) || 500;
  const message = status >= 500 && process.env.NODE_ENV === "production"
    ? "Internal server error. Check server logs."
    : error.message || "Unexpected server error";
  return res.status(status).json({ success: false, message });
}

module.exports = errorHandler;
