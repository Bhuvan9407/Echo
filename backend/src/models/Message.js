const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalText: { type: String, required: true },
  detectedLanguage: { type: String, default: "en" },
  translatedText: { type: String },
  targetLanguage: { type: String },
  safetyStatus: { type: String, enum: ['safe', 'flagged', 'blocked'], default: 'safe' }
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);