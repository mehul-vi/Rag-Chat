const express = require("express");
const pdfRoutes = require("./pdf.routes");
const chatRoutes = require("./chat.routes");

const router = express.Router();

router.use("/pdf", pdfRoutes);
router.use("/chat", chatRoutes);

module.exports = router;
