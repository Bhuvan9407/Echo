// --- UPDATED WITH YOUR REAL RENDER URL ---
const API_BASE_URL = "https://echo-ajh5.onrender.com/api"; 

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("echo_token");
  
  // If no token is found, kick them back to the login page
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  // 1. Fetch the user's alias to replace "Loading..."
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();
    if (data.success) {
      document.getElementById("user-alias").innerText = data.data.alias;
    } else {
      // Token is invalid or expired
      localStorage.removeItem("echo_token");
      window.location.href = "index.html";
    }
  } catch (error) {
    document.getElementById("user-alias").innerText = "Error Loading User";
    console.error("Auth Error:", error);
  }

  // 2. Handle Logout
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("echo_token");
    window.location.href = "index.html";
  });

  // 3. Handle Sending Messages
  const chatForm = document.getElementById("input-area");
  const messageInput = document.getElementById("message-input");
  const chatContainer = document.getElementById("chat-container");
  const targetLanguage = document.getElementById("target-language");

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text) return;

    // Display the user's message in the UI immediately
    const userBubble = document.createElement("div");
    userBubble.className = "message sent";
    userBubble.innerText = text;
    chatContainer.appendChild(userBubble);
    
    // Clear input and scroll down
    messageInput.value = "";
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Add a typing indicator while waiting for the server
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "typing-indicator";
    typingIndicator.innerHTML = "<span></span><span></span><span></span>";
    chatContainer.appendChild(typingIndicator);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Send the message to the backend
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          text: text,
          targetLang: targetLanguage.value
        })
      });

      const data = await response.json();
      
      // Remove typing indicator
      chatContainer.removeChild(typingIndicator);

      if (data.success) {
        // Display the translated response (or AI response)
        const botBubble = document.createElement("div");
        botBubble.className = "message ai-translated";
        botBubble.innerText = data.translatedText || data.reply;
        chatContainer.appendChild(botBubble);
      } else {
        const errorBubble = document.createElement("div");
        errorBubble.className = "message ai-translated safety-flag";
        errorBubble.innerText = "Error: Could not process message.";
        chatContainer.appendChild(errorBubble);
      }
      chatContainer.scrollTop = chatContainer.scrollHeight;

    } catch (error) {
      chatContainer.removeChild(typingIndicator);
      const errorBubble = document.createElement("div");
      errorBubble.className = "message ai-translated safety-flag";
      errorBubble.innerText = "System: Failed to reach server.";
      chatContainer.appendChild(errorBubble);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  });
});