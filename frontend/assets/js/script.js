const header = document.querySelector("[data-header]");
const revealNodes = document.querySelectorAll(".reveal");
const translationButtons = document.querySelectorAll("[data-translation-tabs] button");
const translationPanel = document.querySelector("[data-translation-panel]");
const scrollButtons = document.querySelectorAll("[data-scroll-to]");
const aiTopicButtons = document.querySelectorAll("[data-ai-topic]");
const aiRandomButton = document.querySelector("[data-ai-random]");
const aiText = document.querySelector("[data-typing]");
const resourceToggle = document.querySelector("[data-toggle-resources]");
const resourceList = document.querySelector("[data-resource-list]");

const translations = [
  {
    original: "mujhe stress ho raha hai yaar",
    translated: "I’m feeling stressed right now."
  },
  {
    original: "kal exam hai aur bahut tension ho rahi hai",
    translated: "My exam is tomorrow and I’m feeling very tense."
  },
  {
    original: "I barely slept last night because I was anxious.",
    translated: "నాకు ఆందోళనగా ఉండటం వల్ల నిన్న రాత్రి బాగా నిద్రపోలేదు."
  },
  {
    original: "enna panradhu nu theriyala, romba pressure ah irukku",
    translated: "I do not know what to do; it feels like a lot of pressure."
  }
];

const aiPrompts = {
  exam: "“You mentioned feeling overwhelmed about college recently. Want to talk about what has been on your mind today?”",
  college: "“Last time, college pressure felt heavy. Should we separate what is urgent from what is just making noise?”",
  sleep: "“You said sleep has been difficult lately. Want to look at what usually happens right before bedtime?”",
  anxiety: "“I remember you described a tight, restless feeling. We can slow this down together, one thought at a time.”"
};

const setHeader = () => {
  header.classList.toggle("scrolled", window.scrollY > 12);
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

revealNodes.forEach((node) => revealObserver.observe(node));
window.addEventListener("scroll", setHeader, { passive: true });
setHeader();

translationButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    translationButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    const data = translations[index];
    const fields = translationPanel.querySelectorAll("strong");
    translationPanel.animate([
      { opacity: 0.55, transform: "translateY(6px)" },
      { opacity: 1, transform: "translateY(0)" }
    ], { duration: 260, easing: "ease-out" });
    fields[0].textContent = data.original;
    fields[1].textContent = data.translated;
  });
});

scrollButtons.forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(button.dataset.scrollTo)?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});

aiTopicButtons.forEach((button) => {
  button.addEventListener("click", () => {
    aiTopicButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    aiText.textContent = aiPrompts[button.dataset.aiTopic];
    aiText.animate([
      { opacity: 0.45, transform: "translateY(8px)" },
      { opacity: 1, transform: "translateY(0)" }
    ], { duration: 260, easing: "ease-out" });
  });
});

aiRandomButton?.addEventListener("click", () => {
  const inactive = [...aiTopicButtons].find((button) => !button.classList.contains("active"));
  inactive?.click();
});

resourceToggle?.addEventListener("click", () => {
  const isHidden = resourceList.hasAttribute("hidden");
  resourceList.toggleAttribute("hidden", !isHidden);
  resourceToggle.textContent = isHidden ? "Hide Support Resources" : "View Support Resources";
});

// --- BACKEND INTEGRATION ---

const API_BASE_URL = "https://echo-ajh5.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("register-form");
  const loginForm = document.getElementById("login-form");
  const authMessage = document.getElementById("auth-message");
  
  // Toggle buttons
  const showRegisterBtn = document.getElementById("show-register");
  const showLoginBtn = document.getElementById("show-login");

  // --- UI TOGGLE LOGIC ---
  if (showRegisterBtn && showLoginBtn) {
    showRegisterBtn.addEventListener("click", () => {
      if(registerForm && loginForm) {
        registerForm.style.display = "flex";
        loginForm.style.display = "none";
        authMessage.textContent = ""; // Clear messages
      }
    });

    showLoginBtn.addEventListener("click", () => {
      if(registerForm && loginForm) {
        registerForm.style.display = "none";
        loginForm.style.display = "flex";
        authMessage.textContent = ""; // Clear messages
      }
    });
  }

  // --- REGISTER LOGIC ---
  // Handle Registration
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("reg-email").value;
      const alias = document.getElementById("reg-alias").value;
      const password = document.getElementById("reg-password").value;

      // Collect all 15 answers
      const assessmentAnswers = [];
      for (let i = 1; i <= 15; i++) {
        const selectedOption = document.querySelector(`input[name="q${i}"]:checked`);
        if (selectedOption) {
          assessmentAnswers.push(selectedOption.value);
        }
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Include the assessment array in the request body
          body: JSON.stringify({ email, alias, password, assessment: assessmentAnswers })
        });

        const data = await response.json();
        if (data.success) {
          alert("Registration successful! You can now log in.");
          registerForm.reset();
          registerModal.style.display = "none";
        } else {
          alert(data.message || "Registration failed.");
        }
      } catch (error) {
        console.error("Registration Error:", error);
        alert("An error occurred. Please try again later.");
      }
    });
  }

  // --- LOGIN LOGIC ---
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      authMessage.textContent = "Logging in...";
      authMessage.style.color = "white";

      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
          authMessage.textContent = `Welcome back, ${data.data.alias}! Redirecting...`;
          authMessage.style.color = "#4ade80"; 
          
          // Save the new token
          localStorage.setItem("echo_token", data.data.token);
          loginForm.reset();
          
          // Auto-redirect to the chat interface
          setTimeout(() => window.location.href = "chat.html", 1500);

        } else {
          authMessage.textContent = "Error: " + data.message;
          authMessage.style.color = "#f87171";
        }
      } catch (error) {
        console.error("Fetch error:", error);
        authMessage.textContent = "Server is not responding.";
        authMessage.style.color = "#f87171";
      }
    });
  }
});