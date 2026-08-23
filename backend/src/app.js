const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes"); 

// 1. Initialize the app FIRST
const app = express();

// 2. Setup Middleware
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "http://localhost:5000", 
    "https://echo-safespeak.netlify.app" 
  ],
  credentials: true
}));

// 3. Setup Auth Routes
app.use("/api/auth", authRoutes);

// 4. Setup Chat Route
app.post("/api/chat", (req, res) => {
  const { text, targetLang } = req.body;
  
  res.status(200).json({
    success: true,
    reply: `Echo AI: I received your message "${text}". (Translation to ${targetLang} coming soon!)`
  });
});

// 5. Export the app
module.exports = app;