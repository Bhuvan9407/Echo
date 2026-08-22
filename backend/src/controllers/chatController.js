const Message = require("../models/Message");
const aiService = require("../services/aiService");

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, text, targetLanguage } = req.body;
    const senderId = req.user._id;

    // 1. Check Safety
    const safetyStatus = await aiService.checkSafety(text);
    if (safetyStatus === 'blocked') {
      return res.status(403).json({ success: false, message: "Message blocked due to community guidelines violation." });
    }

    // 2. Mock Translate
    const translatedText = await aiService.translateText(text, targetLanguage || 'en');

    // 3. Save Message
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      originalText: text,
      translatedText,
      targetLanguage: targetLanguage || 'en',
      safetyStatus
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};