import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Your exact Firebase keys
const firebaseConfig = {
  apiKey: "AIzaSyCAEgUZNHvN2ngr_hZ3HazVCf98H5YWcSQ",
  authDomain: "sarathi-ai-88f77.firebaseapp.com",
  databaseURL: "https://sarathi-ai-88f77-default-rtdb.firebaseio.com",
  projectId: "sarathi-ai-88f77",
  storageBucket: "sarathi-ai-88f77.firebasestorage.app",
  messagingSenderId: "700824012154",
  appId: "1:700824012154:web:29737b019da41abc31c2c3",
  measurementId: "G-X21BKVZY75"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Global user session management
let currentUser = null;
let currentProfile = null;

// Auth observer across the whole app
onAuthStateChanged(auth, async (user) => {
    const isAuthPage = window.location.pathname.endsWith("index.html") || 
                       window.location.pathname === "/" || 
                       window.location.pathname.endsWith("SarathiAi/frontend/");
    
    if (user) {
        currentUser = user;
        // Fetch extended profile (role, lang) from Firestore
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
            currentProfile = docSnap.data();
            // Cache profile locally so chat.html script can read it easily
            localStorage.setItem("sarathi_user_id", user.uid);
            localStorage.setItem("sarathi_user_role", currentProfile.role);
            localStorage.setItem("sarathi_user_lang", currentProfile.language);
            localStorage.setItem("sarathi_user_name", currentProfile.name);
        }
        
        // If they are on the login page but are already logged in, redirect them
        if (isAuthPage) {
            window.location.href = "dashboard.html";
        }
    } else {
        currentUser = null;
        currentProfile = null;
        localStorage.removeItem("sarathi_user_id");
        localStorage.removeItem("sarathi_user_role");
        localStorage.removeItem("sarathi_user_lang");
        localStorage.removeItem("sarathi_user_name");
        
        // If not on login page, force redirect back to login
        if (!isAuthPage) {
            window.location.href = "index.html";
        }
    }
});

// A global logout function we can call from any page
window.logoutUser = () => {
    signOut(auth).then(() => {
        window.location.href = "index.html";
    }).catch((error) => {
        alert("Logout failed: " + error.message);
    });
};

export { auth, db, currentUser, currentProfile };
