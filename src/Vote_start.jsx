import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useSocket } from './SocketContext';
import './styleFiles/Vote_start.css';

import avatar1 from './assets/avatar1.png';
import avatar2 from './assets/avatar2.png';
import avatar3 from './assets/avatar3.png';
import avatar4 from './assets/avatar4.png';

// Default avatars for new users
const defaultAvatars = [avatar1, avatar2, avatar3, avatar4];

const Vote_start = () => {
  const navigate = useNavigate();
  const [readyValue, setReadyValue] = useState(false); // false-not ready, true-ready
  const [members, setMembers] = useState([]);
  const socket = useSocket();

  // Toggle readiness and check if all users are ready
  const handleReadyToggle = () => {
    const newReadyValue = !readyValue;
    setReadyValue(newReadyValue);
  
    // Update the current user's status locally
    setMembers(prevMembers => 
      prevMembers.map(member => 
        member.name === localStorage.getItem('name') ? { ...member, status: newReadyValue } : member
      )
    );
  
    console.log('Ready status updated:', newReadyValue);
  
    // Emit the status change to the server
    socket.emit('update-status', { name: localStorage.getItem('name'), ready: newReadyValue });
  
    // Check if all members are ready
    const allReady = members.every(member => member.status || member.name === localStorage.getItem('name') && newReadyValue);
    if (allReady) {
      navigate('/pref');
    }
  };
  

  useEffect(() => {
    if(readyValue)
        navigate('/pref');
  })

  // Initial data retrieval and user join
  useEffect(() => {
    const currUser = JSON.parse(localStorage.getItem('user'));
    if (!currUser) return;

    // Add the current user to the local state
    setMembers(prevMembers => [...prevMembers, { ...currUser, status: false }]);

    // Notify server about the new user
    if (socket) {
      socket.emit("join-party", currUser);
    }
  }, [socket]);

  // Listen for new users joining
  useEffect(() => {
    if (socket) {
      socket.on('new-user', (newUsers) => {
        console.log('Updated user list: ', newUsers);
        setMembers(newUsers);
      });

      // Update status of other users
      socket.on('update-status-broadcast', (updatedUser) => {
        setMembers(prevMembers => 
          prevMembers.map(member => 
            member.name === updatedUser.name ? { ...member, status: updatedUser.status } : member
          )
        );
      });
    }
  }, [socket]);

  // console.log('members: ', members);

  return (
    <div className='start'>
      <div className='banner'>Voting Start</div>
      <h1>Party Rockin:</h1>
      <div className='party'>
        {members.map((member, index) => (
          <PartyMember 
            key={member.socket_id} 
            name={member.name} 
            avatarImg={member.img || defaultAvatars[index % defaultAvatars.length]} 
            status={readyValue} 
          />
        ))}
      </div>
      <button onClick={handleReadyToggle}>
        {readyValue ? "Not Ready" : "I'm Ready!"}
      </button>
    </div>
  );
};

// Separate component for party members
const PartyMember = ({ name, avatarImg, status }) => {
  return (
    <div className='pm'>
      <div className={`status ${status ? 'status-ready' : 'status-notReady'}`}></div>
      <img className='avatar' src={avatarImg} alt={`${name}'s avatar`} />
      <div className='username'>{name}</div>
    </div>
  );
};

export default Vote_start;
