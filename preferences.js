// Preferences.js
import React, { useState } from 'react';
import { firestore, auth } from '../firebaseConfig'; // Import Firestore and Firebase auth
import { doc, setDoc } from 'firebase/firestore'; // Import Firestore functions

const Preferences = ({ onPreferencesSaved }) => {
  const [foodType, setFoodType] = useState(''); // Track input for food type
  const [foodPreferences, setFoodPreferences] = useState([]); // Track list of food preferences

  // Handle preference submission
  const submitPreferences = async () => {
    const userId = auth.currentUser.uid; // Get current user's ID

    try {
      const userRef = doc(firestore, 'users', userId);
      await setDoc(userRef, { preferences: foodPreferences }, { merge: true }); // Save preferences to Firestore
      onPreferencesSaved(); // Notify parent component that preferences are saved
    } catch (error) {
      console.error('Error saving preferences:', error); // Log errors
    }
  };

  // Handle food type submission
  const addFoodPreference = () => {
    if (foodType && !foodPreferences.includes(foodType)) {
      setFoodPreferences((prev) => [...prev, foodType]); // Add the whole food type to preferences
      setFoodType(''); // Clear input after adding
    }
  };

  return (
    <div>
      <h3>Select Your Food Preferences</h3>
      <input
        type="text"
        value={foodType}
        onChange={(e) => setFoodType(e.target.value)} // Update food type state
        placeholder="Enter food type (e.g., Italian)"
      />
      <button onClick={addFoodPreference}>Add Preference</button> {/* Button to add food preference */}
      <button onClick={submitPreferences}>Save Preferences</button> {/* Save preferences button */}
      <div>
        <h4>Your Preferences:</h4>
        <ul>
          {foodPreferences.map((pref, index) => (
            <li key={index}>{pref}</li> // List of preferences
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Preferences; // Export the Preferences component
