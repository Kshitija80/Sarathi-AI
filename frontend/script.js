document.addEventListener("DOMContentLoaded", () => {
  const chatContainer = document.getElementById("chat-container");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const micBtn = document.getElementById("mic-btn");
  const typingIndicator = document.getElementById("typing-indicator");
  const initialTime = document.getElementById("initial-time");

  // Image attachment elements
  const attachBtn = document.getElementById("attach-btn");
  const fileInput = document.getElementById("file-input");
  const imagePreviewContainer = document.getElementById(
    "image-preview-container",
  );
  const imagePreview = document.getElementById("image-preview");
  const removeImageBtn = document.getElementById("remove-image-btn");

  let currentImageBase64 = null;

  // Set initial message time
  if (initialTime) {
    initialTime.textContent = getCurrentTime();
  }

  // Scroll to bottom
  function scrollToBottom() {
    chatContainer.scrollTo({
      top: chatContainer.scrollHeight,
      behavior: "smooth",
    });
  }

  // Time format
  function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  }

  // Add message
  function addMessage(text, sender, imageUrl = null) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add(
      "message",
      sender === "user" ? "user-message" : "bot-message",
    );

    const content = document.createElement("div");
    content.classList.add("message-content");

    if (imageUrl) {
      const img = document.createElement("img");
      img.src = imageUrl;
      content.appendChild(img);
    }

    const p = document.createElement("p");
    p.textContent = text;
    content.appendChild(p);

    const time = document.createElement("div");
    time.classList.add("message-time");
    time.textContent = getCurrentTime();

    messageDiv.appendChild(content);
    messageDiv.appendChild(time);

    chatContainer.appendChild(messageDiv);
    scrollToBottom();
  }

  // MAIN SEND FUNCTION
  async function handleSend() {
    const text = userInput.value.trim();
    if (text === "" && !currentImageBase64) return;

    const textToSend = text || "Please analyze this image.";

    // Show user message, including image thumbnail if one exists
    addMessage(
      textToSend,
      "user",
      currentImageBase64 ? imagePreview.src : null,
    );

    // Prepare payload dynamically loading the logged-in User's ID and customized Role
    const payload = {
      message: textToSend,
      userId: localStorage.getItem("sarathi_user_id") || "anonymous",
      role: localStorage.getItem("sarathi_user_role") || "general",
      lang: localStorage.getItem("sarathi_user_lang") || "en-US",
    };
    if (currentImageBase64) {
      payload.image = currentImageBase64;
    }

    // Reset UI
    userInput.value = "";
    userInput.focus();
    imagePreviewContainer.style.display = "none";
    currentImageBase64 = null;
    fileInput.value = "";

    // Show typing indicator
    typingIndicator.style.display = "flex";
    scrollToBottom();

    try {
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      // Hide typing indicator
      typingIndicator.style.display = "none";

      // Show bot reply
      addMessage(data.reply, "bot");
      
      // If the backend provided audio (like for Marathi), play it.
      // Otherwise, fallback to browser's native text-to-speech (for English).
      if (data.audio) {
          playAudio(data.audio);
      } else {
          speakReply(data.reply);
      }
    } catch (error) {
      typingIndicator.style.display = "none";
      addMessage("⚠️ Error connecting to server", "bot");
      console.error(error);
    }
  }

  // Events
  sendBtn.addEventListener("click", handleSend);

  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  });

  // --- IMAGE ATTACHMENT LOGIC ---
  attachBtn.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target.result;
        imagePreview.src = result;
        imagePreviewContainer.style.display = "flex";

        // Extract pure base64 (remove data:image/jpeg;base64, prefix)
        currentImageBase64 = result.split(",")[1];
      };
      reader.readAsDataURL(file);
    }
  });

  removeImageBtn.addEventListener("click", () => {
    imagePreviewContainer.style.display = "none";
    imagePreview.src = "";
    currentImageBase64 = null;
    fileInput.value = ""; // clear input
  });

  // --- REAL VOICE INPUT (Speech-to-Text) ---
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition;
  let isRecording = false;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    // Language will be dynamically set on click

    recognition.onstart = () => {
      isRecording = true;
      micBtn.classList.add("recording");
      userInput.placeholder = "Listening...";
      userInput.disabled = true;
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      userInput.value = transcript;
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      isRecording = false;
      micBtn.classList.remove("recording");
      userInput.placeholder = "Type your message...";
      userInput.disabled = false;
      userInput.focus();

      // Automatically send the message
      if (userInput.value.trim() !== "") {
        handleSend();
      }
    };
  }

  micBtn.addEventListener("click", () => {
    if (!SpeechRecognition) {
      alert(
        "Voice recognition is not supported in this browser. Please try using Google Chrome.",
      );
      return;
    }

    if (isRecording) {
      recognition.stop();
    } else {
      // Pull strictly from the Profile settings saved in localStorage
      recognition.lang = localStorage.getItem("sarathi_user_lang") || "en-US";
      recognition.start();
    }
  });

  // --- REAL VOICE OUTPUT (Text-to-Speech) ---
  let availableVoices = [];

  function loadVoices() {
    availableVoices = window.speechSynthesis.getVoices();
    console.log("Loaded voices:", availableVoices.length);
  }

  if ("speechSynthesis" in window) {
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  function speakReply(text) {
    if ("speechSynthesis" in window) {
      // Clean markdown and emojis
      const cleanText = text
        .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "")
        .replace(/[*#_~`\[\]()]/g, "")
        .trim();

      const targetLang = localStorage.getItem("sarathi_user_lang") || "en-US";

      const speech = new SpeechSynthesisUtterance();
      speech.text = cleanText;
      speech.lang = targetLang;
      speech.rate = 0.85; // Slower for clarity

      // Try to find a premium Google voice first for clarity
      if (availableVoices.length > 0) {
        let bestVoice = availableVoices.find(
          (v) =>
            (v.lang === targetLang ||
              v.lang.replace("_", "-").startsWith(targetLang.split("-")[0])) &&
            v.name.toLowerCase().includes("google"),
        );

        // Fallback: If no Google voice is found, find ANY voice that matches the target language
        if (!bestVoice) {
          bestVoice = availableVoices.find(
            (v) =>
              v.lang === targetLang ||
              v.lang.replace("_", "-").startsWith(targetLang.split("-")[0]),
          );
        }

        if (bestVoice) {
          speech.voice = bestVoice;
        }
      }

      // Error handling to see why it fails
      speech.onerror = (e) => console.error("Speech Synthesis Error:", e);

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(speech);
    } else {
      console.error("Text-to-Speech is not supported in this browser.");
    }
  }

  // --- STOP VOICE ON TAB SWITCH/LEAVE ---
  // If the user navigates away or switches tabs, stop the AI voice immediately.
  window.addEventListener("beforeunload", () => {
    window.speechSynthesis.cancel();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.speechSynthesis.cancel();
    }
  });
});
function playAudio(audioData) {
  if (!audioData) return;

  if (Array.isArray(audioData)) {
    let index = 0;
    function playNext() {
      if (index >= audioData.length) return;
      const audio = new Audio("data:audio/mpeg;base64," + audioData[index].base64);
      audio.onended = playNext;
      audio.play();
      index++;
    }
    playNext();
  } else {
    const audio = new Audio("data:audio/mpeg;base64," + audioData);
    audio.play();
  }
}
