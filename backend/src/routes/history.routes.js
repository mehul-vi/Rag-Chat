const express = require("express");
const {
  getHistory,
  getSession,
  createSession,
  updateSession,
  deleteSession,
} = require("../controllers/history.controller");

const router = express.Router();

router.get("/", getHistory);
router.get("/:id", getSession);
router.post("/", createSession);
router.put("/:id", updateSession);
router.delete("/:id", deleteSession);

module.exports = router;
