import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useSocket } from './SocketContext';
import './styleFiles/Vote_join.css';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Vote_join = () => {
  const [inputValue, setInputValue] = useState(sessionStorage.getItem('groupId') ? sessionStorage.getItem('groupId') : ' ');
  const [groupID, setGroupID] = useState('');
  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => { //have to reload page for the socket to connect
    if(socket){
      if(inputValue !== ' '){
        socket.emit('created-groupID', inputValue);
      }

      socket.on("connect", () => {
        console.log(socket.id); 
      });
      socket.on('receiveGroup', (data) => {
        console.log('data: ', data);
        if(data !== null){
          setGroupID(data);
          setInputValue(data);
          sessionStorage.setItem('groupId', data);
        }
        console.log('socket data: ', data);
        console.log('group id: ', sessionStorage.getItem('groupId'));
      });
    }
    console.log('user info from local storage:', sessionStorage.getItem('user'));
  }, [socket]);

  const joinGroup = async () => {
    console.log('user had id? : ',JSON.parse(sessionStorage.getItem('user')));
    const user = JSON.parse(sessionStorage.getItem('user'));
    const userId = user?.uid;

    if (!userId) {
      toast.error("User ID not found. Please log in again.");
      return;
    }

    if(!inputValue) {
      toast.error("Please enter a Group ID.");
      return;
    }

    try{
      const response = await fetch(`http://localhost:3000/join-group`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          groupId: inputValue,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Joined group successfully!");
        setTimeout(() => {
          navigate("/start");
        }, 3000); // Delay navigation for 3 seconds
      } else {
        alert(`Error: ${data.error}`);
      } 
    } catch (error) {
        console.error('Error joining group:', error);
        toast.error("Failed to join group.");
      } 
  };
  return (
    <div className='join'>
      <ToastContainer position="bottom-right" autoClose={3000} />
      <div className='banner'>Voting Join</div>
      <div className='meetingDiv'>
        <label> Meeting ID </label>
        <input name="myInput" value={inputValue} onChange={(e) => setInputValue(e.target.value)}/>
        <button type="button" onClick={joinGroup}>Enter</button>
      </div>
    </div>
  );
};
//Note: group ID autogenerated? sent via text/email?

export default Vote_join 