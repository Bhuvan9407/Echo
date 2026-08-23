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
app.post("/api/chat", (req, res) => {
  const { text, targetLang } = req.body;
  
  // For now, let's just make the server echo the message back so we know it works!
  // Later, we will connect this to an AI or a real human using WebSockets.
  res.status(200).json({
    success: true,
    reply: `Echo AI: I received your message "${text}". (Translation to ${targetLang} coming soon!)`
  });
});

module.exports = app;