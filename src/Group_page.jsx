import React from "react";
import { useNavigate } from "react-router-dom";
import "./styleFiles/Group_page.css"; // Ensure the CSS file is linked properly

const Group_page = () => {
  const navigate = useNavigate();

  // Function to create a group and navigate to the Vote_join page
  const handleCreateGroup = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user ? user.uid : null;

    if (!userId) {
      alert("Please log in first.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/create-group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      alert(`Group Created! Group ID: ${data.groupId}`);
      // Navigate to the Vote_join page
      navigate("/join");
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group. Please try again.");
    }
  };

  // Function to navigate to the Vote_join page directly
  const handleJoinGroup = () => {
    navigate("/join");
  };

  return (
    <div className="group-container">
      <h1>Welcome to Group Page</h1>
      <h2>Create or Join a Group</h2>

      <div className="button-container">
        {/* Button to create a group */}
        <button className="btn create-btn" onClick={handleCreateGroup}>
          Create Group
        </button>

        {/* Button to join a group */}
        <button className="btn join-btn" onClick={handleJoinGroup}>
          Join Group
        </button>
      </div>
    </div>
  );
};

export default Group_page;
