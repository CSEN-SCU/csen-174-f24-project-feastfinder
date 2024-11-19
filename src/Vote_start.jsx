import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useSocket } from './SocketContext';

import './styleFiles/Vote_start.css';

import avatar1 from './assets/avatar1.png'
import avatar2 from './assets/avatar2.png'
import avatar3 from './assets/avatar3.png'
import avatar4 from './assets/avatar4.png'
const member = [
  {name: 'noName', img: avatar1, status: 2},
  {name: 'bigman', img: avatar2, status: 2},
  {name: 'lil wayne', img: avatar3, status: 2},
  {name: 'Mrpp', img: avatar4, status: 2},

];


const Vote_start = ({Socket}) => {
  const navigate = useNavigate();
  const [readyValue, setReadyValue] = useState(0); // 0-not ready, 1-ready, 2- not connected
  const [members, setMember] = useState([member[Math.floor(Math.random()*4)],]);
  const [trigger, setTrigger] = useState(false); //triggers rerender for update status
  const socket = useSocket();

  const readyOrNot = () => {
    // if(readyValue == 1){
    //   setReadyValue(0);
    //   member[0].status = 0;
    // }else{
    //   setReadyValue(1);
    //   member[0].status = 1;
    // }
    members[0].status = !readyValue;
    setReadyValue(!readyValue);

    if(members.every(m => m.status == 1))
      navigate('/pref');

  }

  useEffect(() => {
    if(socket)
      socket.emit("start-page", members[0], (m) => console.log(m));      //join server for party
  }, []) //remove [] for everytime it rerenders

  useEffect(() => {
    if(socket){
      socket.on('new-user', (newU) => {
        console.log('*********** adding new user ***********');
        console.log('new user: ', newU);
        // members.splice(members[0], 1);
        setMember(m => [...m, newU]);          //receive new user
      })
    }
  },[])
  useEffect(() => {
    console.log('hello')
      if(socket){
        socket.on('update-status-broad', user => {
          if(!user)
            return;

          console.log('all members: ', members);
          members.map(m => {
              console.log('member: ',m, ' user: ', user);

              if(m.name == user.name){
                m.status = user.status;
                setTrigger(!trigger);
                console.log('status should be updated');
              }
          })
        })

      }
  }, [socket, members])

  return (
    <div className='start'>
      <div className='banner'>Voting Start</div>
      <h1>Party Rockin:</h1>
      <div className='party'>
        {members.map((m) => (partyMember(m.name, m.img, m.status)))}
      </div>
      <button onClick={readyOrNot}>{!readyValue? "I'm Ready!" : "Not Ready"}</button>
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