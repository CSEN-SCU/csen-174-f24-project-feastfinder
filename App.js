// App.js
import './App.css';
import React, { useEffect, useState } from 'react';
import { auth } from './firebaseConfig'; // Import Firebase authentication
import Login from './components/login'; // Import Login component
import Preferences from './components/preferences'; // Import Preferences component
import Group from './components/group'; // Import Group component
import VotingPage from './components/voting'; // Import VotingPage component

function App() {
  const [user, setUser] = useState(null); // Track logged-in user
  const [preferencesSet, setPreferencesSet] = useState(false); // Track if preferences are set
  const [groupId, setGroupId] = useState(''); // Track the joined group ID

  // Check for user authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user); // Update user state based on authentication
    });
    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  // Callback to handle when preferences are saved
  const handlePreferencesSaved = () => {
    setPreferencesSet(true); // Set preferences as saved
  };

  // Callback to handle when a user joins a group
  const handleGroupJoined = (joinedGroupId) => {
    setGroupId(joinedGroupId); // Update the group ID when joined
  };

  return (
    <div className="App">
      <h1>Welcome to Restaurant Finder</h1>
      {user ? (
        <div>
          <p>Welcome, {user.displayName}</p>
          <button onClick={() => auth.signOut()}>Logout</button>
          
          {/* Conditional rendering based on user's progress */}
          {!preferencesSet ? (
            <Preferences onPreferencesSaved={handlePreferencesSaved} />
          ) : !groupId ? (
            <Group onGroupJoined={handleGroupJoined} userId={user.uid} />
          ) : (
            <VotingPage groupId={groupId} userId={user.uid} />
          )}
        </div>
      ) : (
        <Login /> // Show login component if not authenticated
      )}
    </div>
  );
}

export default App; // Export the App component
