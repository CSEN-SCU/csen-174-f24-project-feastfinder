import React, { useEffect, useState } from "react";
import { useNavigate }  from "react-router-dom";
import "./styleFiles/Profile_page.css"; // Separate CSS file for styles

import avatar1 from './assets/avatar1.png';
import avatar2 from './assets/avatar2.png';
import avatar3 from './assets/avatar3.png';
import avatar4 from './assets/avatar4.png';
const avatars = [avatar1, avatar2, avatar3, avatar4];


const Profile_page = () => {
  const [profileData, setProfileData] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log(profileData)
    const fetchProfileData = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        const response = await fetch(`http://localhost:3000/profile?id=${user.uid}`);//&email=${user.email}`);

        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }

        const data = await response.json();
        console.log('server res data: ', data);

        setProfileData(data);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile data.");
      }
    };

    fetchProfileData();
  }, []);

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!profileData) {
    return <div className="loading">Loading...</div>;
  }

  const groups = profileData.groups || [];

  const groupHandler = (groupId) => {
    navigate(`/group/${groupId}`)
  };

  return (
    <div className="profile-container">
      {/* User Info Section */}
      <div className="section">
        <h3>User Info</h3>
        <div
          className="profile-picture"
          style={{
            //backgroundImage: `url(${avatar1 || "https://via.placeholder.com/200"})`,
            backgroundImage: `url(${profileData.picture })`, //|| avatars[Math.floor(Math.random()*4)]})`, 
          }}
        />
        <div className="user-details">
          <strong>Name: </strong> &nbsp; {profileData.name || "Unknown"} <br />
        </div>
      </div>

      {/* Preferences Section */}
      <div className="section">
        <h3>Preferences</h3>
        <h4>Top 3 Food Types:</h4>
        <ul className="preferences-list">
          {profileData.preferences?.length ? (
            profileData.preferences.map((pref, index) => (
              <li key={index}>{pref}</li>
            ))
          ) : (
            <li>No preferences available</li>
          )}
        </ul>
        <h4>Recent:</h4>
        <ul className="preferences-list">
          {profileData.recent?.length ? (
            profileData.recent.map((recent, index) => (
              <li key={index}>{recent}</li>
            ))
          ) : (
            <li>No recent activity</li>
          )}
        </ul>
      </div>

      {/* Groups Section */}
      <div className="section">
        <h3>Groups</h3>
        <ul className="groups-list">
          {groups?.length ? (
            groups.map((group, index) => {
              console.log('Group Data:', group);
              return (
                <li key={group.groupId || index}>
                  <a
                    onClick={() => groupHandler(group.groupId)}
                    className="group-link"
                  >
                    {group.groupId}
                  </a>
                </li>
              );
            }) 
          ) : (
            <li>No groups found</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Profile_page;
