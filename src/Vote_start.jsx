import React, { useState, useEffect, useReducer } from 'react';
import { useNavigate } from "react-router-dom";
import { useSocket } from './SocketContext';
import './styleFiles/Vote_start.css';

import avatar1 from './assets/avatar1.png';
import avatar2 from './assets/avatar2.png';
import avatar3 from './assets/avatar3.png';
import avatar4 from './assets/avatar4.png';

// Default avatars for new users
const defaultAvatars = [avatar1, avatar2, avatar3, avatar4];

///NOTE: BEST VERSION SO FAR! EVERYTHING SEEMS TO WORK! refresh is still a slight issue

const Vote_start = () => {
  const navigate = useNavigate();
  const [readyValue, setReadyValue] = useState(false); // false-not ready, true-ready
  const [members, setMembers] = useState([]);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const socket = useSocket();

  // Check if all members are ready and navigate
  useEffect(() => {
    if(members.length !== 0 && members.every(m => m.status == 1)){
      console.log('all users ready!!');
      navigate('/pref');
    }
  }, [members]);

  // Get initial user and send join to party
  useEffect(() => {
    if (socket) {
      const curr = JSON.parse(sessionStorage.getItem('user'));
      socket.emit('join-party', {
        name: curr.name,
        email: curr.email,
        img: curr.picture,
        status: readyValue,
      }, (us) => {
        let serverUserData = us.filter(u => u.email === curr.email);
        let otherUsers = us.filter(u => u.email !== curr.email);
        if (otherUsers == null)
          setMembers(m => [...m, ...serverUserData]);
        else
          setMembers(m => [...m, ...serverUserData, ...otherUsers]);
      });
    }
    return () => { socket.off('join-party'); }
  }, []);

  // Add socket listener for new users
  useEffect(() => {
    if (socket) {
      const curr = JSON.parse(sessionStorage.getItem('user'));
      socket.on('new-user', (newUsers) => {
        const newMembers = newUsers.filter(user => user.email !== curr.email);
        const newUniqueMembers = newMembers.filter(newUser =>
          !members.some(existingUser => existingUser.email === newUser.email)
        );
        if (newUniqueMembers.length > 0) {
          setMembers(prevMembers => [...prevMembers, ...newUniqueMembers]);
        }
      });
    }
    return () => {
      if (socket) {
        socket.off('new-user');
      }
    };
  }, [members]);

  // Add socket listener for getting updated status values
  useEffect(() => {
    if (socket) {
      socket.on('update-status-broad', (ustat) => {
        setMembers(prevMembers =>
          prevMembers.map(member =>
            member.socket_id === ustat.socket_id ? { ...member, status: (ustat.status ? 1 : 0) } : member
          )
        );
      });
    }
    return () => {
      if (socket) {
        socket.off('update-status-broad');
      }
    };
  }, [socket]);

  // Update current user status values
  useEffect(() => {
    setMembers(prevMembers =>
      prevMembers.map((member, index) =>
        index === 0 ? { ...member, status: (readyValue ? 1 : 0) } : member
      )
    );
  }, [readyValue]);

  // Send status update to the server
  const handleReadyToggle = () => {
    const rv = !readyValue;
    setReadyValue(rv);

    if (socket && members) {
      const curr = members[0];
      socket.emit('update-status', { socket_id: curr?.socket_id, status: rv }, (response) => {
        console.log('Status updated: ', response);
      });
    }
  };

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
            status={index === 0 ? readyValue : member.status}
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
