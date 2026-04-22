const admin = require("firebase-admin");

// Make sure you place your Firebase serviceAccountKey.json file in the 'backend' folder
// You can get this from your Firebase Console -> Project Settings -> Service Accounts -> Generate new private key
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Get Firestore instance
const db = admin.firestore();

module.exports = db;
