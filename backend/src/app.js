const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes"); 

const app = express();

app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:3000", 
    "http://localhost:5000", 
    "https://echo-safespeak.netlify.app" 
  ],
  credentials: true
}));

// Authentication Routes
app.use("/api/auth", authRoutes);

// --- ADD THIS NEW CHAT ROUTE ---
app.post("/api/chat", async (req, res) => {
  const { text, targetLang } = req.body;
  
  // 1. Simple Crisis Detection (You can expand this list!)
  const crisisKeywords = ["kill myself", "end it", "can't take this anymore", "want to die", "suicide", "hurt myself"];
  
  const isCrisis = crisisKeywords.some(keyword => text.toLowerCase().includes(keyword));

  if (isCrisis) {
    // If a crisis is detected, immediately send the safety flag response
    return res.status(200).json({
      success: true,
      isFlagged: true,
      reply: "We noticed this may be a serious situation. You are not alone. Please consider reaching out to a local helpline or emergency support."
    });
  }

  // 2. Normal Chat Response (If no crisis is detected)
  try {
    // --- THIS IS WHERE YOUR GEMINI API CALL GOES ---
    // (Assuming you already have this code working since the chat works!)
    
    res.status(200).json({
      success: true,
      isFlagged: false,
      reply: `Echo AI: I understand you are saying "${text}". I am here to listen.` // Replace with actual Gemini reply variable
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "AI generation failed" });
  }
});

module.exports = app;