import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useSocket } from './SocketContext';

import rest1 from './assets/Resturants/rest1.jpg';
import rest2 from './assets/Resturants/rest2.jpg';
import rest3 from './assets/Resturants/rest3.jpg';
import rest4 from './assets/Resturants/rest4.jpg';
import rest5 from './assets/Resturants/rest5.jpg';
import norest from './assets/Resturants/norest.jpg';

import './styleFiles/Vote_pref.css';

const Vote_pref = () => {
  const [top3picks, setTop3picks] = useState([]);
  const socket = useSocket();
  const navigate = useNavigate();

  const exampleResturants = [
    {name: "French", img: rest1},
    {name: "Italian", img: rest2},
    {name: "Mexican", img: rest3},
    {name: "American", img: rest4},
    {name: "Korean", img: rest5},
  ];

  const foodClicked = (name) => {
    let picked = exampleResturants.find( (r) => r.name == name);
    if(top3picks.length != 3)
      console.log('Adding to picks:', picked);  // Debug log
      setTop3picks([...top3picks, picked]);
  };

  const buttonHandler = async () => {
    console.log(top3picks);
    if (top3picks.length === 3) {
      try {
        console.log("Attempting restaurant fetch...");
        const response = await fetch('http://localhost:3000/getCuratedRestaurants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preferences: top3picks }),
        });
  
        if (response.ok) {
          const data = await response.json();
  
          // Emit the 'send-curated-restaurants' event with the data
          socket.emit('send-curated-restaurants', data);
  
          // Listen for the 'all-ready' event from the server
          socket.once('all-ready', (allReady) => {
            console.log("Received 'all-ready' event:", allReady);
            if (allReady) {
              console.log("Navigating to /voting page");
              navigate('/voting'); // Navigate to /voting when ready
            } else {
              console.error('Not ready for navigation');
            }
          });
        } else {
          console.error('Error fetching curated restaurants:', response.statusText);
        }
      } catch (error) {
        console.error('Error sending preferences:', error);
      }
    }
  };  

  return (
    <div className='pref'>
      <div className='banner'>Preferences</div>
      <div className='top3'>
        {
          (top3picks.length > 0) ? top3picks.map((t, i) => topPicks(t.name, t.img, i+1)) : [0,1,2].map(i => topPicks(' ', norest, i+1))
        }
      </div>
      <div className='choices'>
        {exampleResturants.map(r => foodOptions(r.name, r.img, foodClicked))}
      </div>
      {top3picks.length === 3 ? (
  console.log('Rendering button'),  // Debug log
  <button onClick={() => { 
    console.log('Button clicked!');
    buttonHandler(); 
  }}>Done</button>
) : null}

    </div>
  );
};

const topPicks = (name, imgsrc, num) => {
  return (
    <div className='restItem' key={num}>
      <h2>{num}</h2>
      <img className='imgCircle-sm' src={imgsrc}/>
      <h3>{name}</h3>
    </div>
  );
};

const foodOptions = (name, imgsrc, fn) => {
  return (
    <div className='restItem' key={name} onClick={() => fn(name)}>
      <img className='imgCircle' src={imgsrc}/>
      <h3>{name}</h3>
    </div>
  );
};

export default Vote_pref;
