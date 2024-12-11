import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { useSocket } from './SocketContext';

import './styleFiles/Vote_voting.css'

// STYLING NEEDS FIX AND DATA FETCH SLOW and sometimes data has repeat resturants?
const restData = [];

const Vote_voting = () => {
  const [selected, setSelect] = useState([]);
  const [userLocation, setUserLocation] = useState({});
  const [restData, setRestData] = useState([]);
  const navigate = useNavigate();
  const socket = useSocket();

  //get location data and send to server 
  useEffect(() => {
    // console.log('iasodfjoiasdjof;iadsn;fjjnasdfd');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords; 
          // console.log('location: ', latitude, ' : ', longitude);
          setUserLocation({longitude, latitude});
        },
        (error) => { console.error('Error getting user location:', error); }
    );
    }else {
        console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  useEffect(() => {
    if(socket && userLocation.hasOwnProperty('latitude')){
        console.log(userLocation);
        socket.emit('generate-resturants', userLocation, (ack) => { console.log('ack: ', ack) })
    }
  }, [userLocation])

  useEffect(() => {
    if(socket){
      socket.on('rest-picks', (rd) => {
        setRestData(rd);
      })
    }
  },[])
  

  const restSelect = (name) => {
    if(name != null && selected.length < 3){
      setSelect((s) => [...s, name]);         //highlight div when selected => class: !important
    }else{  
      socket.emit('is-vote-done', selected, (arg) => {
        console.log(arg)
      });
      navigate('/final');
    }
  }

  return (
    <div className='voting'>
      <div className='banner-s'>Voting</div>
      <div className='dataPanel'>
        {
          (restData.length === 0) ? <h1> Loading...</h1> :
          restData.map((r, i) => (
            <RestComp key={r.name+i} r={r} restSelect={restSelect} />
          ))
        }
      </div>
    </div>
  )
}



const RestComp = ({r, restSelect}) => {
  const [highlight, setHighlight] = useState(false);
  // let highlight = false;

  const clickHander = (name) => {
    setHighlight(!highlight);
    console.log('hello');

    restSelect(name);
  }

  // console.log('hours ', r.business_hours);
  return(
    <div className={`restComp ${highlight ? 'selected' : ' '}`} onClick={()=> restSelect(r.name)} style={{padding: '10px'}}>
      <img className='compImg' src={r.img}/>
        <h1>{r.name}</h1>

        <h3>Price: {r.price || '$'}</h3>
        <h3>Cuisine: {r.cuisine}</h3>
        <h3>Rating: {r.rating}</h3>
        <h3>distance: {(r.distance*0.000621).toFixed(3)} mi</h3>
    </div>
  )
}

export default Vote_voting