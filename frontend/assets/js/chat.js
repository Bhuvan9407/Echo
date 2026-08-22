const API_BASE_URL = "https://echo-ajh5.onrender.com";
const token = localStorage.getItem("echo_token");

// 1. Security Check
if (!token) {
  window.location.href = "index.html";
}

let currentUser = null;

document.addEventListener("DOMContentLoaded", async () => {
  const userAliasSpan = document.getElementById("user-alias");
  const logoutBtn = document.getElementById("logout-btn");
  const chatContainer = document.getElementById("chat-container");
  const inputArea = document.getElementById("input-area");
  const messageInput = document.getElementById("message-input");
  const targetLanguage = document.getElementById("target-language");

  // 2. Fetch Logged-in User Profile
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await response.json();
    
    if (data.success) {
      currentUser = data.data;
      userAliasSpan.textContent = currentUser.alias;
    } else {
      localStorage.removeItem("echo_token");
      window.location.href = "index.html";
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
  }

  // 3. Handle Logout
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("echo_token");
    window.location.href = "index.html";
  });

  // 4. Send Message to Backend
  inputArea.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = messageInput.value;
    const lang = targetLanguage.value;

    if (!text.trim()) return; // Don't send empty messages

    // Display user's message immediately
    appendMessage(text, "sent");
    messageInput.value = "";

    // START LOADING ANIMATION
    showTyping();

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          receiverId: currentUser._id, 
          text: text, 
          targetLanguage: lang 
        })
      });

      const data = await response.json();

      // STOP LOADING ANIMATION
      removeTyping();

      if (data.success) {
        const aiResponse = `Translated: ${data.data.translatedText}`;
        appendMessage(aiResponse, "ai-translated", data.data.safetyStatus);
      } else {
        appendMessage(`System: ${data.message}`, "ai-translated", "blocked");
      }
    } catch (error) {
      removeTyping();
      appendMessage("System: Failed to reach server.", "ai-translated");
    }
  });

  // --- HELPER FUNCTIONS ---

  function showTyping() {
    const div = document.createElement("div");
    div.id = "typing-indicator";
    div.className = "typing-indicator";
    // Create the three pulsing dots
    div.innerHTML = "<span></span><span></span><span></span>";
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function removeTyping() {
    const indicator = document.getElementById("typing-indicator");
    if (indicator) {
      indicator.remove();
    }
  }

  function appendMessage(text, type, safetyStatus = 'safe') {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${type}`;
    msgDiv.textContent = text;

    if (safetyStatus !== 'safe') {
      const flag = document.createElement("span");
      flag.className = "safety-flag";
      flag.textContent = `⚠️ Flagged by Echo Safety: ${safetyStatus}`;
      msgDiv.appendChild(flag);
    }

    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll to bottom
  }
});