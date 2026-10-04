const ChatSession = require("../models/chatSession.model");
const { isConnected } = require("../config/db");

const getHistory = async (req, res) => {
  const { uid } = req.query;
  if (!uid) {
    return res.status(400).json({ success: false, message: "User ID (uid) is required" });
  }

  if (!isConnected()) {
    return res.json({ success: true, history: [], notice: "MongoDB is not connected" });
  }

  const sessions = await ChatSession.find({ uid }).sort({ updatedAt: -1 }).lean();
  const formatted = sessions.map((s) => ({
    id: s._id.toString(),
    uid: s.uid,
    title: s.title,
    fileName: s.fileName,
    documentId: s.documentId,
    messages: s.messages || [],
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }));

  res.json({ success: true, history: formatted });
};

const getSession = async (req, res) => {
  const { id } = req.params;
  if (!isConnected()) {
    return res.status(503).json({ success: false, message: "Database not connected" });
  }

  const session = await ChatSession.findById(id).lean();
  if (!session) {
    return res.status(404).json({ success: false, message: "Chat session not found" });
  }

  res.json({
    success: true,
    session: {
      id: session._id.toString(),
      uid: session.uid,
      title: session.title,
      fileName: session.fileName,
      documentId: session.documentId,
      messages: session.messages || [],
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    },
  });
};

const createSession = async (req, res) => {
  const { uid, title, fileName, documentId, messages = [] } = req.body;
  if (!uid) {
    return res.status(400).json({ success: false, message: "User ID (uid) is required" });
  }

  if (!isConnected()) {
    return res.status(503).json({ success: false, message: "Database not connected" });
  }

  const session = await ChatSession.create({
    uid,
    title: title || fileName || "New Chat",
    fileName: fileName || "",
    documentId: documentId || null,
    messages,
  });

  res.status(201).json({
    success: true,
    session: {
      id: session._id.toString(),
      uid: session.uid,
      title: session.title,
      fileName: session.fileName,
      documentId: session.documentId,
      messages: session.messages || [],
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    },
  });
};

const updateSession = async (req, res) => {
  const { id } = req.params;
  const { title, fileName, documentId, messages } = req.body;

  if (!isConnected()) {
    return res.status(503).json({ success: false, message: "Database not connected" });
  }

  const updateFields = {};
  if (title !== undefined) updateFields.title = title;
  if (fileName !== undefined) updateFields.fileName = fileName;
  if (documentId !== undefined) updateFields.documentId = documentId;
  if (messages !== undefined) updateFields.messages = messages;

  const session = await ChatSession.findByIdAndUpdate(id, updateFields, { new: true }).lean();
  if (!session) {
    return res.status(404).json({ success: false, message: "Chat session not found" });
  }

  res.json({
    success: true,
    session: {
      id: session._id.toString(),
      uid: session.uid,
      title: session.title,
      fileName: session.fileName,
      documentId: session.documentId,
      messages: session.messages || [],
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    },
  });
};

const deleteSession = async (req, res) => {
  const { id } = req.params;

  if (!isConnected()) {
    return res.status(503).json({ success: false, message: "Database not connected" });
  }

  const result = await ChatSession.findByIdAndDelete(id);
  if (!result) {
    return res.status(404).json({ success: false, message: "Chat session not found" });
  }

  res.json({ success: true, message: "Session deleted successfully" });
};

module.exports = {
  getHistory,
  getSession,
  createSession,
  updateSession,
  deleteSession,
};
