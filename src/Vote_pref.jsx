import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useSocket } from './SocketContext';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
// import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';

const norest = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/A_black_image.jpg/640px-A_black_image.jpg';

import resturant_prefs from './pref_images';


import './styleFiles/Vote_pref.css'

const Vote_pref = () => {
  const [top3picks, setTop3picks] = useState([]);
  const [allReady, setAllReady] = useState(false);
  const rests = resturant_prefs;
  const socket = useSocket();
  const navigate = useNavigate();

  
  const foodClicked = (name) => {
    let picked = rests.find( (r) => r.name == name)

    if(top3picks.length != 3)
      setTop3picks([...top3picks, picked]);

  }
  useEffect(() => {
    if(socket){
      socket.on('all-pref-gotten', r => {
        console.log('all ready res: ', r);
        setAllReady(r);
      })
    }
  }, [])
  useEffect(() => {
    navFunc();
  }, [allReady])

  const navFunc = () => {
    if(allReady)
      navigate('/voting');
    else
      toast.info("Waiting for other Party Members!");
  }
  const buttonHandler = () => {
    if(top3picks.length == 3 && socket){
      localStorage.setItem('prefs', JSON.stringify(top3picks));

      socket.emit('user-pref', top3picks);

      navFunc();
    }
  }

  return (
    <div className='pref'>
      <div className='banner'>Preferences</div>
      <div className='top3'>{
          (top3picks.length > 0) ? top3picks.map((t, i) => topPicks(t.name, t.img, i+1)) : [0,1,2].map(i => topPicks(' ', norest, i+1))
        }</div>
      <div className='choices'>
        <Swiper
          slidesPerView={3}
          navigation={true}
          loop={true}
          spaceBetween={3}
          modules={[Navigation]}
          className="mySwiper"
          style={{marginLeft: '40px'}}
        > 
          { rests.map(r => foodOptions(r.name, r.img, foodClicked)) }
        </Swiper>
      </div>
      {top3picks.length == 3 ? <button onClick={buttonHandler}>Done</button> : null}
    </div>
  )
}
const topPicks = (name, imgsrc, num) => {
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
    <SwiperSlide key={name}>
      <div className='card' key={name} onClick={() => fn(name)} style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.1)), url(${imgsrc})`, 
          backgroundSize: 'cover', // Adjust as needed
          backgroundPosition: 'center', // Adjust as needed
        }}> 
        <h3 style={{color: 'white', fontSize: '30px', marginTop: '15px'}}>{name}</h3>
      </div>
    </SwiperSlide>
  )
}
export default Vote_pref