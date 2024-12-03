import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useSocket } from './SocketContext';

import './styleFiles/Vote_voting.css';

import norest from './assets/Resturants/norest.jpg';

const Vote_voting = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selected, setSelect] = useState([]);
  const navigate = useNavigate();
  const socket = useSocket();

  const restSelect = (name) => {
    if (name != null && selected.length < 3) {
      setSelect((s) => [...s, name]);
    } else {
      socket.emit('is-vote-done', selected, (arg) => {
        console.log(arg);
      });
      navigate('/final');
    }
  };

  useEffect(() => {
    socket.on('send-curated-restaurants', (data) => {
      if (Array.isArray(data) && data.length > 0) {
        setRestaurants(data);
        console.log('Restaurants set:', data); // Log after state update
      } else {
        console.log('Invalid restaurant data:', data);
      }
    });
  
    return () => {
      socket.off('send-curated-restaurants');
    };
  }, [socket]);  

  return (
    <div className='voting'>
      <div className='banner-s'>Voting</div>
      <div className='dataPanel'>
        {console.log('Restaurants length:', restaurants.length)}  {/* Debugging line */}
        {restaurants.length > 0 ? 
          restaurants.map(r => restComp(r, restSelect)) : 
          <div>No restaurants available</div>}
      </div>
    </div>
  );  
};

// Function to render each restaurant component
const restComp = (r, restSelect) => {
  return (
    <div className='restComp' key={r.name} onClick={() => restSelect(r.name)}>
      <img className='compImg' src={r.image_url || norest} alt={r.name}/>
      <div>
        <h1>{r.name}</h1>
        <h2>Price: {r.price || 'N/A'}</h2>
      </div>
      <div style={{display:'flex', flexDirection: 'column', justifyContent:'center'}}>
        <h1>Cuisine: {r.categories?.[0]?.title || 'N/A'}</h1>
        <h4 style={{display:'flex', flexWrap:'wrap'}}>Description: {r.description || 'No description available'}</h4>
      </div>
    </div>
  );
};

export default Vote_voting;
