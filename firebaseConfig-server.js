const admin = require('firebase-admin');
const path = require('path');

// Path to your service account key file
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
  databaseURL: "https://feast-finder-95126.firebaseio.com",
});

// Firestore and Authentication instances
const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
