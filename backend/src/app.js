const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes"); // Adjust if your routes file is named differently

const app = express();

// Middleware
app.use(express.json());

// --- THIS IS THE FIX FOR THE NETLIFY ERROR ---
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "http://localhost:5000", 
    "https://echo-safespeak.netlify.app" // Allows Netlify to connect!
  ],
  credentials: true
}));

// Routes
app.use("/api/auth", authRoutes);

module.exports = app;