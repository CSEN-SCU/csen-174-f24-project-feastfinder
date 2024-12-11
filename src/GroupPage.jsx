import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const GroupPage = () => {
  const { groupId } = useParams(); // Extract groupId from URL parameters
  const [groupData, setGroupData] = useState(null); // State to hold group data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const navigate = useNavigate(); // To navigate to other pages

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        if (!groupId) {
          throw new Error("No group ID provided.");
        }

        const response = await fetch(`http://localhost:3000/group/${groupId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch group details.");
        }

        const data = await response.json();
        setGroupData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  if (loading) {
    return <div className="loading">Loading group details...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="group-container">
      <div className="group-header">
        <h1>{groupData ? `${groupData.groupId}` : "Group Name"}</h1>
      </div>
      <div className="member-header" style={{margin: '1rem 2rem'}}> 
        <u>MEMBERS</u> 
      </div>
      <div className="members-list">
        {groupData.members.map((member) => (
          <div
            className="member-item"
            key={member.uid}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px",
              marginBottom: "8px",
              background: "#f9f9f9",
              borderRadius: "5px",
              border: "1px solid #ddd",
            }}
          >
            <img
              src={
                member.picture !== "default_picture_url"
                  ? member.picture
                  : "https://via.placeholder.com/50"
              }
              alt={`${member.name}'s profile`}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                marginRight: "16px",
              }}
            />
            <div className="member-info">
              <div
                className="name"
                style={{ fontWeight: "bold", fontSize: "1em" }}
              >
                {member.name}
              </div>
              <div
                className="email"
                style={{ fontSize: "0.9em", color: "#555" }}
              >
                {member.email}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupPage;