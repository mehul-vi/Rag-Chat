const express = require("express");
const pdfRoutes = require("./pdf.routes");
const chatRoutes = require("./chat.routes");
const historyRoutes = require("./history.routes");

const router = express.Router();

router.use("/pdf", pdfRoutes);
router.use("/chat", chatRoutes);
router.use("/history", historyRoutes);

module.exports = router;
