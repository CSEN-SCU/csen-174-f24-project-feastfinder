import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import './styleFiles/Vote_start.css';

import avatar1 from './assets/avatar1.png'
import avatar2 from './assets/avatar2.png'
import avatar3 from './assets/avatar3.png'
import avatar4 from './assets/avatar4.png'

const Vote_start = () => {
  const navigate = useNavigate();
  const [readyValue, setReadyValue] = useState(0); // 0-not ready, 1-ready, 2- not connected

  const member = [
    {name: 'noName', img: avatar1, status: 2},
    {name: 'mmDefeater', img: avatar2, status: 1},
    {name: 'msNasty', img: avatar3, status: 1},
  ];
  const currentUser = {name: 'EdgeLord', img: avatar4};

  const readyOrNot = () => {
    if(readyValue == 1)
      setReadyValue(0);
    else
      setReadyValue(1);

    console.log(readyValue)
  }
  useEffect(() => {  //need use effect to get immediate update of var to start navigatation 
    if(member[1].status == 1 && readyValue==1) //use socket to get all users status
      navigate('/pref'); 
   }, [readyValue]) 

  return (
    <div className='start'>
      <div className='banner'>Voting Start</div>
      <h1>Party:</h1>
      <div className='party'>
        {partyMember(currentUser.name, currentUser.img, readyValue)}
        {member.map((m) => (partyMember(m.name, m.img, m.status)))}
      </div>
      <button onClick={readyOrNot}>{!readyValue? "I'm Ready!!" : "Not Ready"}</button>
    </div>
  )
}


const partyMember = (name, avatarImg, status) => {
  let statusClass = 'status';
  if(status==0) //not ready
    statusClass = 'status status-notReady';
  else if(status==1) //ready
    statusClass = 'status status-ready';
  else //disconnected - may not need
    statusClass = 'status';
    

  return(
    <div className='pm' key={name}>
      <div className={statusClass}></div>
      <img className='avatar' src={avatarImg}/>
      <div className='username'>{name}</div>
    </div>
  )
}

export default Vote_start