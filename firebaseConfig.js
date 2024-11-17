// firebaseConfig.js
const admin = require('firebase-admin');
const { fileURLToPath } = require('url');
const { dirname } = require('path');

// Dynamically resolve the correct file path
const __dirname = dirname(fileURLToPath(import.meta.url));

// Import the service account key JSON file
import serviceAccount from './config/serviceAccountKey.json' assert { type: 'json' }; // Add assertion for JSON

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://feast-finder-95126.firebaseio.com" // Replace with your Firebase database URL
});

// Firestore initialization
const db = admin.firestore();

export { db };