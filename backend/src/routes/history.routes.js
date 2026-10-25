const express = require("express");

const router = express.Router();

// Chat History Sessions (In-Memory / Graceful fallback for Frontend)
router.get("/", (req, res) => {
  res.json({ success: true, history: [] });
});

router.get("/:id", (req, res) => {
  res.json({
    success: true,
    session: {
      id: req.params.id,
      title: "Chat Session",
      messages: [],
    },
  });
});

router.post("/", (req, res) => {
  const session = {
    id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    title: req.body?.title || req.body?.fileName || "New Chat",
    fileName: req.body?.fileName || "",
    documentId: req.body?.documentId || null,
    messages: req.body?.messages || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  res.status(201).json({ success: true, session });
});

router.put("/:id", (req, res) => {
  res.json({
    success: true,
    session: {
      id: req.params.id,
      ...(req.body || {}),
      updatedAt: new Date(),
    },
  });
});

router.delete("/:id", (req, res) => {
  res.json({ success: true, message: "Session deleted" });
});

module.exports = router;
