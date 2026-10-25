const multer = require("multer");
const { maxUploadMb } = require("../config/env");

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter(req, file, callback) {
    const isPdf = file.mimetype === "application/pdf" || /\.pdf$/i.test(file.originalname || "");
    if (isPdf) return callback(null, true);
    const error = new Error("Only PDF files are supported.");
    error.status = 400;
    return callback(error);
  },
  limits: { fileSize: maxUploadMb * 1024 * 1024, files: 1 },
});

module.exports = upload;
