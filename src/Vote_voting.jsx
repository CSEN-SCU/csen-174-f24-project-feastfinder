import React, { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { useSocket } from './SocketContext';

import './styleFiles/Vote_voting.css'

import rest1 from './assets/Resturants/rest1.jpg'
import rest2 from './assets/Resturants/rest2.jpg'
import rest3 from './assets/Resturants/rest3.jpg'
import rest4 from './assets/Resturants/rest4.jpg'
import rest5 from './assets/Resturants/rest5.jpg'
import norest from './assets/Resturants/norest.jpg'

const Vote_voting = () => {
  const [selected, setSelect] = useState([]);
  const navigate = useNavigate();
  const socket = useSocket();

  const restSelect = (name) => {
    if(name != null && selected.length < 3)
      setSelect((s) => [...s, name]);         //highlight div when selected => class: !important
    else{  
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
        { restData.map(r => restComp(r, restSelect)) }
      </div>
    </div>
  )
}

const restComp = (r, restSelect) => {

  return(
    <div className='restComp' key={r.name} onClick={()=> restSelect(r.name)}>
      <img className='compImg' src={r.picture}/>
      <div>
        <h1>{r.name}</h1>
        <h2>Price: {r.price}</h2>
      </div>
      <div style={{display:'flex', flexDirection: 'column', justifyContent:'center'}}>
        <h1>Cuisine: {r.foodType}</h1>
        <h4 style={{display:'flex', flexWrap:'wrap'}}>Description: {r.description}</h4>
      </div>
    </div>
  )
}

const restData = [
  {
    "name": "Sunset Grill",
    "picture": rest1,
    "foodType": "American",
    "price": "$$",
    "description": "Enjoy classic American dishes with a view, specializing in burgers, steaks, and fresh salads."
  },
  {
    "name": "Bistro Bon Vivant",
    "picture":  rest2,
    "foodType": "French",
    "price": "$$$",
    "description": "A cozy French bistro offering authentic dishes, including escargot, coq au vin, and fresh pastries."
  },
  {
    "name": "Sushi Zen",
    "picture":  rest3,
    "foodType": "Japanese",
    "price": "$$$",
    "description": "Fresh and flavorful sushi and sashimi served in a traditional setting with modern touches."
  },
  {
    "name": "La Cucina Verde",
    "picture":  rest4,
    "foodType": "Italian",
    "price": "$$",
    "description": "Homemade pasta, wood-fired pizzas, and a fine selection of wines make this a favorite for Italian lovers."
  },
  {
    "name": "Spice Route",
    "picture":  rest5,
    "foodType": "Indian",
    "price": "$",
    "description": "Aromatic spices and authentic curries in a vibrant setting that transports you straight to India."
  }
];
export default Vote_voting