// Group.js
import React, { useState } from 'react';
import { firestore } from '../firebaseConfig'; // Import Firestore
import { doc, setDoc, getDoc, arrayUnion, increment } from 'firebase/firestore'; // Import Firestore functions

const Group = ({ onGroupJoined, userId }) => {
  const [groupId, setGroupId] = useState(''); // Track group ID input
  const [message, setMessage] = useState(''); // For feedback messages
  const [foodPreferences, setFoodPreferences] = useState([]); // Track food preferences
  const [selectedPreference, setSelectedPreference] = useState(''); // Track selected food preference
  const [voteSubmitted, setVoteSubmitted] = useState(false); // Track if vote has been submitted

  // Join or create a group
  const joinGroup = async () => {
    if (!groupId) {
      setMessage('Please enter a group ID.'); // Prompt for group ID if empty
      return;
    }

    const groupRef = doc(firestore, 'groups', groupId);

    try {
      const groupSnap = await getDoc(groupRef);

      if (groupSnap.exists()) {
        // Group exists, join it
        await setDoc(groupRef, { members: arrayUnion(userId) }, { merge: true });
        setMessage(`You have joined the group ${groupId}.`);
      } else {
        // Group does not exist, create it
        await setDoc(groupRef, { members: [userId], votes: {} }, { merge: true });
        setMessage(`You have created and joined the group ${groupId}.`);
      }

      // Notify the App to transition to the next state
      onGroupJoined(groupId);
      fetchGroupPreferences(); // Fetch preferences immediately after joining
    } catch (error) {
      console.error('Error joining or creating group:', error);
      setMessage('An error occurred while joining the group.'); // Handle errors
    }
  };

  // Fetch group preferences from Firestore
  const fetchGroupPreferences = async () => {
    if (groupId) {
      const groupRef = doc(firestore, 'groups', groupId);
      const groupSnap = await getDoc(groupRef);

      if (groupSnap.exists()) {
        const groupData = groupSnap.data();
        setFoodPreferences(Object.keys(groupData.votes || {})); // Load existing vote options
      }
    }
  };

  // Cast a vote for the selected food preference
  const submitVote = async () => {
    if (!selectedPreference) {
      setMessage("Please select a preference to vote."); // Message if no preference is selected
      return;
    }

    const groupRef = doc(firestore, 'groups', groupId);

    try {
      await setDoc(groupRef, {
        [`votes.${selectedPreference}`]: increment(1),
      });
      setVoteSubmitted(true); // Prevent further voting after submission
    } catch (error) {
      console.error('Error submitting vote:', error); // Log errors
    }
  };

  return (
    <div>
      <h2>Join or Create a Group</h2>
      <input
        type="text"
        placeholder="Group ID"
        value={groupId}
        onChange={(e) => setGroupId(e.target.value)} // Update group ID state
      />
      <button onClick={joinGroup}>Join Group</button>

      {message && <p>{message}</p>} {/* Show confirmation message */}

      {foodPreferences.length > 0 && !voteSubmitted && (
        <div>
          <h3>Vote on a Food Category</h3>
          <select
            value={selectedPreference}
            onChange={(e) => setSelectedPreference(e.target.value)} // Update selected preference
          >
            <option value="">Select a category</option>
            {foodPreferences.map((pref, index) => (
              <option key={index} value={pref}>
                {pref}
              </option>
            ))}
          </select>
          <button onClick={submitVote}>Submit Vote</button> {/* Submit vote button */}
        </div>
      )}
      {voteSubmitted && <p>Thank you for voting!</p>} {/* Show thank you message */}
    </div>
  );
};

export default Group; // Export the Group component
