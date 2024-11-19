import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useSocket } from './SocketContext';

import rest1 from './assets/Resturants/rest1.jpg'
import rest2 from './assets/Resturants/rest2.jpg'
import rest3 from './assets/Resturants/rest3.jpg'
import rest4 from './assets/Resturants/rest4.jpg'
import rest5 from './assets/Resturants/rest5.jpg'
import norest from './assets/Resturants/norest.jpg'


import './styleFiles/Vote_pref.css'

const Vote_pref = () => {
  const [top3picks, setTop3picks] = useState([]);
  const socket = useSocket();
  const navigate = useNavigate();

  const exampleResturants = [
    {name: "Bite Me Bistro", img: rest1},
    {name: "Chew Chew Train", img: rest2},
    {name: "Pasta La Vista, Baby!", img: rest3},
    {name: "Grill 'Em All", img: rest4},
    {name: "Eggcellent Eats", img: rest5},
  ]

  const foodClicked = (name) => {
    let picked = exampleResturants.find( (r) => r.name == name)
    if(top3picks.length != 3)
      setTop3picks([...top3picks, picked]);

  }
  const buttonHandler = () => {
    if(top3picks.length == 3 && socket){
      socket.emit('user-pref', top3picks);
      socket.on('all-ready', allReady => {
        if(allReady)
          navigate('/voting'); 
      })
    }
  }

  // useEffect(() => {
  //   socket.on('all-ready', (r) => {
  //     if(r.ready)
        
  //   })
  // }, [])

  return (
    <div className='pref'>
      <div className='banner'>Preferences</div>
      <div className='top3'>{
          (top3picks.length > 0) ? top3picks.map((t, i) => topPicks(t.name, t.img, i+1)) : [0,1,2].map(i => topPicks(' ', norest, i+1))
        }</div>
      <div className='choices'>{exampleResturants.map(r => foodOptions(r.name, r.img, foodClicked))}</div>
      {top3picks.length == 3 ? <button onClick={buttonHandler}>Done</button> : null}
    </div>
  )
}
const topPicks = (name, imgsrc, num) => {
  console.log('name: ', name);
  return(
    <div className='restItem' key={num}>
      <h2>{num}</h2>
      <img className='imgCircle-sm' src={imgsrc}/>
      <h3>{name}</h3>
    </div>
  )
}
const foodOptions = (name, imgsrc, fn) => {
  return(
    <div className='restItem' key={name} onClick={() => fn(name)}>
      <img className='imgCircle' src={imgsrc}/>
      <h3>{name}</h3>
    </div>
  )
}
export default Vote_pref