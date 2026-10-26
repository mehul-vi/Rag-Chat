const express = require("express");
const mongoose = require("mongoose");
const ChatSession = require("../models/session.model");
const { connectDB } = require("../config/db");

const router = express.Router();

// Fallback in-memory storage if MongoDB is not accessible
const inMemorySessions = new Map();

// Helper to check if MongoDB is connected
const isMongoReady = () => mongoose.connection.readyState === 1;

// GET /api/history - Retrieve all chat sessions for a user
router.get("/", async (req, res) => {
  const uid = req.query?.uid;
  if (!uid) {
    return res.json({ success: true, history: [] });
  }

  try {
    if (isMongoReady()) {
      const docs = await ChatSession.find({ uid }).sort({ updatedAt: -1 }).lean();
      const history = docs.map((doc) => ({
        id: doc._id.toString(),
        uid: doc.uid,
        title: doc.title,
        fileName: doc.fileName,
        documentId: doc.documentId,
        totalPages: doc.totalPages || 0,
        currentPage: doc.currentPage || 1,
        isFavourite: Boolean(doc.isFavourite),
        messages: doc.messages || [],
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      }));
      return res.json({ success: true, history });
    }
  } catch (err) {
    console.warn("[History API] MongoDB find error:", err.message);
  }

  // Fallback to in-memory
  const userSessions = Array.from(inMemorySessions.values())
    .filter((s) => s.uid === uid)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return res.json({ success: true, history: userSessions });
});

// GET /api/history/:id - Retrieve a single chat session
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    if (isMongoReady() && mongoose.isValidObjectId(id)) {
      const doc = await ChatSession.findById(id).lean();
      if (doc) {
        return res.json({
          success: true,
          session: {
            id: doc._id.toString(),
            uid: doc.uid,
            title: doc.title,
            fileName: doc.fileName,
            documentId: doc.documentId,
            totalPages: doc.totalPages || 0,
            currentPage: doc.currentPage || 1,
            isFavourite: Boolean(doc.isFavourite),
            messages: doc.messages || [],
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
          },
        });
      }
    }
  } catch (err) {
    console.warn("[History API] MongoDB get error:", err.message);
  }

  const memoryDoc = inMemorySessions.get(id);
  if (memoryDoc) {
    return res.json({ success: true, session: memoryDoc });
  }

  return res.status(404).json({ success: false, message: "Session not found" });
});

// POST /api/history - Create a new chat session
router.post("/", async (req, res) => {
  const { uid, title, fileName, documentId, totalPages, currentPage, isFavourite, messages } = req.body || {};
  if (!uid) {
    return res.status(400).json({ success: false, message: "uid is required" });
  }

  try {
    if (isMongoReady()) {
      const session = new ChatSession({
        uid,
        title: title || fileName || "New Chat",
        fileName: fileName || "",
        documentId: documentId || null,
        totalPages: Number(totalPages) || 0,
        currentPage: Number(currentPage) || 1,
        isFavourite: Boolean(isFavourite),
        messages: Array.isArray(messages) ? messages : [],
      });
      const saved = await session.save();
      return res.status(201).json({ success: true, session: saved.toJSON() });
    }
  } catch (err) {
    console.warn("[History API] MongoDB create error:", err.message);
  }

  // Fallback in-memory
  const id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const memorySession = {
    id,
    uid,
    title: title || fileName || "New Chat",
    fileName: fileName || "",
    documentId: documentId || null,
    totalPages: Number(totalPages) || 0,
    currentPage: Number(currentPage) || 1,
    isFavourite: Boolean(isFavourite),
    messages: Array.isArray(messages) ? messages : [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  inMemorySessions.set(id, memorySession);

  return res.status(201).json({ success: true, session: memorySession });
});

// PUT /api/history/:id - Update an existing session
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updateData = { ...(req.body || {}), updatedAt: new Date() };
  delete updateData._id;
  delete updateData.id;

  try {
    if (isMongoReady() && mongoose.isValidObjectId(id)) {
      const updated = await ChatSession.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      if (updated) {
        return res.json({ success: true, session: updated.toJSON() });
      }
    }
  } catch (err) {
    console.warn("[History API] MongoDB update error:", err.message);
  }

  // Fallback in-memory
  const existing = inMemorySessions.get(id);
  if (existing) {
    const next = { ...existing, ...updateData };
    inMemorySessions.set(id, next);
    return res.json({ success: true, session: next });
  }

  return res.json({
    success: true,
    session: { id, ...updateData },
  });
});

// DELETE /api/history/:id - Delete a session
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    if (isMongoReady() && mongoose.isValidObjectId(id)) {
      await ChatSession.findByIdAndDelete(id);
    }
  } catch (err) {
    console.warn("[History API] MongoDB delete error:", err.message);
  }

  inMemorySessions.delete(id);
  return res.json({ success: true, message: "Session deleted" });
});

module.exports = router;
