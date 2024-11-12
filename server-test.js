
// server.js
import express from 'express';
import cors from 'cors';
import { getAuth } from 'firebase-admin/auth';
import { db } from './firebaseConfig.js'; // Import the Firestore instance from firebaseConfig.js

const app = express();
const PORT = 8080;

// Middleware for CORS and parsing JSON
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static('frontend'));

// Route for Google login
app.post('/login/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'Missing ID token.' });
    }

    // Verify ID token with Firebase Admin SDK
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Store user data in Firestore
    await db.collection('users').doc(uid).set(
      {
        uid,
        name: decodedToken.name,
        email: decodedToken.email,
        lastLogin: new Date().toISOString()
      },
      { merge: true } // Merge with existing data if the user already exists
    );

    res.status(200).json({
      message: "User signed in successfully",
      user: { uid, name: decodedToken.name, email: decodedToken.email }
    });
  } catch (error) {
    console.error("Login failed", error);
    res.status(500).json({ error: "Login failed", details: error.message });
  }
});

// Create a new group
app.post('/create-group', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Generate a new group ID (you can choose a different strategy)
    const groupId = `group-${Date.now()}`;

    // Create the group in Firestore
    await db.collection('groups').doc(groupId).set({
      groupId,
      createdBy: userId,
      members: [userId], // Add the user who created the group as a member
      createdAt: new Date().toISOString()
    });

    res.status(200).json({ message: 'Group created successfully', groupId });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group', details: error.message });
  }
});

// Join an existing group
app.post('/join-group', async (req, res) => {
  const { userId, groupId } = req.body;
  if (!userId || !groupId) {
    return res.status(400).json({ error: "User ID and Group ID are required" });
  }

  try {
    // Check if the group exists
    const groupRef = db.collection('groups').doc(groupId);
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Add the user to the group's members list if not already a member
    const groupData = groupDoc.data();
    if (!groupData.members.includes(userId)) {
      groupData.members.push(userId);
      await groupRef.update({ members: groupData.members });
    }

    res.status(200).json({ message: 'Joined group successfully' });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ error: 'Failed to join group', details: error.message });
  }
});

// Get group details by groupId
app.get('/group/:groupId', async (req, res) => {
    const { groupId } = req.params;
  
    try {
      const groupRef = db.collection('groups').doc(groupId);
      const groupDoc = await groupRef.get();
  
      if (!groupDoc.exists) {
        return res.status(404).json({ error: 'Group not found' });
      }
  
      const groupData = groupDoc.data();
      const members = groupData.members; // List of user IDs
  
      // Get details of each member
      const memberDetails = [];
      for (let uid of members) {
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();
  
        if (userDoc.exists) {
          const userData = userDoc.data();
          memberDetails.push({
            uid: userData.uid,
            name: userData.name,
            email: userData.email,
            picture: userData.picture || 'default_picture_url', // Assuming you store picture URL
          });
        }
      }
  
      res.status(200).json({ groupId, members: memberDetails });
    } catch (error) {
      console.error('Error fetching group details:', error);
      res.status(500).json({ error: 'Failed to fetch group details', details: error.message });
    }
  });
  

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
