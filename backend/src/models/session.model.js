const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "ai", "assistant"], required: true },
    content: { type: String, required: true },
    sources: [
      {
        fileName: { type: String, default: "" },
        pageNumber: { type: Number, default: null },
        chunkIndex: { type: Number, default: null },
        score: { type: Number, default: null },
        snippet: { type: String, default: "" },
      },
    ],
  },
  { _id: false, timestamps: false }
);

const sessionSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, index: true },
    title: { type: String, default: "New Chat" },
    fileName: { type: String, default: "" },
    documentId: { type: String, default: null, index: true },
    totalPages: { type: Number, default: 0 },
    currentPage: { type: Number, default: 1 },
    isFavourite: { type: Boolean, default: false },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

sessionSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id ? ret._id.toString() : ret.id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.models.ChatSession || mongoose.model("ChatSession", sessionSchema);
