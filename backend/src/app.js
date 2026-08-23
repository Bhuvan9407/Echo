// Add this near the top of app.js (under the other requires)
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini with your new Environment Variable Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- THE REAL CHAT ROUTE ---
app.post("/api/chat", async (req, res) => {
  const { text, targetLang } = req.body;
  
  try {
    // 1. Tell Gemini to use the fast, free-tier friendly model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. Give Gemini strict instructions
    const prompt = `
      You are the core intelligence of Echo, an anonymous peer-support app.
      A user has sent this message: "${text}"
      
      Task 1: Determine if this message is a severe mental health crisis (e.g., suicide, self-harm, extreme danger).
      Task 2: Translate the message accurately into the language code: ${targetLang}. Keep the original tone.

      Return ONLY a JSON object in this exact format, with no markdown formatting or extra words:
      {
        "isCrisis": true or false,
        "translation": "your translated text here"
      }
    `;

    // 3. Send to Google!
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the JSON Gemini gave us
    const aiData = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, ''));

    // 4. Send the result back to your frontend!
    if (aiData.isCrisis) {
      return res.status(200).json({
        success: true,
        isFlagged: true,
        reply: "We noticed this may be a serious situation. You are not alone. Please consider reaching out to a local helpline or emergency support."
      });
    }

    res.status(200).json({
      success: true,
      isFlagged: false,
      reply: aiData.translation
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ success: false, message: "AI generation failed" });
  }
});