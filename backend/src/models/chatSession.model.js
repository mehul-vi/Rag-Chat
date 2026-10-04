const mongoose = require("mongoose");

const sourceSchema = new mongoose.Schema(
  {
    fileName: { type: String, default: "" },
    pageNumber: { type: Number, default: 1 },
    chunkIndex: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    snippet: { type: String, default: "" },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "ai"], required: true },
    content: { type: String, required: true },
    sources: [sourceSchema],
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const chatSessionSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, index: true },
    title: { type: String, default: "New Chat" },
    fileName: { type: String, default: "" },
    documentId: { type: String, default: null },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

chatSessionSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("ChatSession", chatSessionSchema);
