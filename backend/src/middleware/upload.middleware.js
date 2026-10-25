const multer = require("multer");
const httpError = (status, message) => Object.assign(new Error(message), { status });

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
