const multer = require("multer");
const httpError = require("../utils/httpError");

// Memory storage: nothing is written to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") return cb(null, true);
    cb(httpError(400, "Only PDF files are allowed"));
  },
});

module.exports = upload;
