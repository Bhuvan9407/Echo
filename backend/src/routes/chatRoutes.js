const express = require("express");
const router = express.Router();
const { sendMessage } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

// Route requires the user to be logged in (protect)
router.post("/", protect, sendMessage);

module.exports = router;