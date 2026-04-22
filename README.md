🚜 Sarathi AI
Multilingual Voice-Based AI Assistant for Farmers, Students & Workers

Sarathi AI is a real-world, AI-powered web application designed to provide personalized assistance through voice, text, and image inputs.
It focuses on solving problems for farmers, students, and daily workers using intelligent, multilingual support.

✨ Features:

🧠 AI-Powered Assistance
Uses Google Gemini AI for intelligent, real-time responses
Provides role-based answers (Farmer / Student / Worker)
🌾 Role-Based Personalization
👨‍🌾 Farmers → Crop advice, agriculture help
🎓 Students → Study guidance, learning tips
👷 Workers → Job-related support
📸 Multimodal Support
Upload images (e.g., crop diseases, documents)
AI analyzes images + text together for better results
🗣️ Voice Integration
🎤 Speech-to-Text: Ask questions using voice
🔊 Text-to-Speech: Chatbot replies with voice output
Built using HTML5 Web Speech API (no external dependency)
🌐 Multilingual Support
Supports:
English
Hindi
Marathi
Automatically adapts based on user preference
🔐 Authentication System
Secure login/signup using Firebase Authentication
Persistent user sessions
💾 Cloud Database
Stores chat history in Firebase Firestore
Data linked to each user securely
📱 Responsive UI
Clean and modern interface
Works on mobile and desktop
Designed for accessibility (especially rural users)
📸 Screenshots
🔐 Login Page

💬 Chat Interface

📷 Image Upload Feature

🛠️ Tech Stack
🔹 Frontend
HTML5
CSS3 (Responsive UI, Gradients)
JavaScript (ES6)
Web Speech API (Voice features)
Firebase Web SDK
🔹 Backend
Node.js
Express.js
REST APIs
Firebase Admin SDK
🔹 AI Integration
Google Gemini API (Gemini 2.5 Flash)
🔹 Database
Firebase Firestore
⚙️ How It Works
User (Voice/Text/Image)
        ↓
Frontend (HTML + JS)
        ↓
Backend (Node.js + Express)
        ↓
Gemini AI (Processing)
        ↓
Response + Voice Output
        ↓
Displayed to User
🚀 Getting Started (Run Locally)
📌 Prerequisites
Install Node.js (v18 or above)
Create Firebase project
Get Gemini API Key
🛠️ Installation
1️⃣ Clone Repository
git clone https://github.com/YourUsername/SarathiAi.git
cd SarathiAi/backend
2️⃣ Install Dependencies
npm install
3️⃣ Setup Environment Variables

Create .env file inside backend:

PORT=3000
GEMINI_API_KEY=your_gemini_key_here
4️⃣ Add Firebase Key

Place:

serviceAccountKey.json

inside backend/

5️⃣ Run Backend
node server.js
6️⃣ Run Frontend
Open frontend/index.html
OR use Live Server in VS Code
💡 Developer Notes
Uses HTML5 Web Speech API:
SpeechRecognition → Voice input
speechSynthesis → Voice output
No external voice API required (fast + free)
Designed with real-world usability in mind:
Rural accessibility
Voice-first interaction
Simple UI
🎯 Future Enhancements
🌐 Offline Mode for low internet areas
📍 Location-based recommendations
🧠 Chat memory & personalization
🎤 Improved regional voice (Marathi TTS APIs)
📊 Admin dashboard
👩‍💻 Author

Kshitija More
IT Engineering Student