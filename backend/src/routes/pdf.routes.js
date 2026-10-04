const express = require("express");
const upload = require("../middleware/upload.middleware");
const { uploadPDF } = require("../controllers/pdf.controller");

const router = express.Router();
router.post("/upload", upload.single("pdf"), uploadPDF);

module.exports = router;
