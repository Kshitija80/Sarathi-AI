const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require("./firebase"); // Firebase connection

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
// Set a 10MB limit so large image base64 strings don't crash the server
app.use(express.json({ limit: "10mb" }));

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Base system instruction logic
const getSystemInstruction = (role) => `
You are Sarathi AI, a helpful assistant.
Context: You are currently talking to a ${role || "general user"}. 
Rules:
- Speak in simple language
- Be friendly and motivating
- Give practical advice tailored specifically to their role (e.g. if they are a farmer, focus on agriculture; if a student, focus on education).
`;

// Model name
const MODEL_NAME = "gemini-2.5-flash";

// Test route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Chat API
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const imageBase64 = req.body.image;
    const userId = req.body.userId || "anonymous";
    const role = req.body.role || "user";

    if (!userMessage) {
      return res.status(400).json({ reply: "Message is required." });
    }

    console.log(
      `💬 User (${userId} - ${role}):`,
      userMessage.substring(0, 30) + "...",
    );

    // Dynamically initialize the model for THIS specific user context!
    const personalizedModel = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: getSystemInstruction(role),
    });

    // Construct parts array dynamically
    const parts = [{ text: userMessage }];
    if (imageBase64) {
      parts.push({
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg",
        },
      });
      console.log("📸 Image attached to AI prompt.");
    }

    // Generate AI response with multimodal support and specific persona
    const result = await personalizedModel.generateContent({
      contents: [
        {
          role: "user",
          parts: parts,
        },
      ],
    });

    const responseText = result.response.text();

    // 🔥 Save chat to Firebase
    try {
      await db.collection("chats").add({
        userId: userId, // Link this chat strictly to the logged-in user
        userMessage: userMessage,
        hasImage: !!imageBase64,
        botReply: responseText,
        timestamp: new Date(),
      });
      console.log("✅ Chat saved to Firestore successfully.");
    } catch (firebaseError) {
      console.error("🔥 Error saving to Firebase:", firebaseError);
      // We don't crash the program if DB saving fails, we still return the AI response!
    }

    // Send response
    res.json({
      reply: responseText,
    });
  } catch (error) {
    console.error("❌ Error generating content:", error);

    // Check if this is a Google Gemini Quota/Rate Limit error
    if (
      error.message &&
      (error.message.includes("429") ||
        error.message.includes("Quota") ||
        error.message.includes("quota"))
    ) {
      return res.status(429).json({
        reply:
          "⏳ I am receiving too many requests right now! Please wait about a minute and try asking again.",
      });
    }

    res.status(500).json({
      reply: "⚠️ AI not working. Try again.",
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
