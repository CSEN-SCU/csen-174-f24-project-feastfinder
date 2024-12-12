import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSocket } from './SocketContext';
import './styleFiles/Vote_final.css'; // Create this CSS file for styling

// FINAL RESULTS SHOULD WAIT FOR ALL USERS TO SELECT!!! 

const Vote_final = () => {
  const [results, setResults] = useState([]);
  const [keyRes, setKeyRes] = useState([]);
  const [error, setError] = useState('');
  const socket = useSocket(); // Adjust URL if necessary

  useEffect(() => {
    // Listen for 'vote-results' event from the server
    socket.on('vote-results', (data) => {
      console.log(data)
      // const hold = Object.keys(data);
      // console.log('keys: ', hold, ' key length: ', hold.length);
      // setKeyRes(Object.keys(data));
      setResults(data);
    });
    // Handle errors
    socket.on('connect_error', () => {
      setError('Failed to connect to the server.');
    });
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="vote-final">
      <h1>Top 3 Restaurant Picks</h1>
      {results.length > 0 ? (
        <div className="results">
          {results.map((r, index) => {
            if(index >= 3)
                return
            return(
              <div className="result-card" key={r.name+index}>
                <h2>{index + 1}. {r.name}</h2>
                <p>Votes: {r.count}</p>
              </div>
          )})}
        </div>
      ) : (
        <p>Loading results...</p>
      )}
    </div>
  );
};

export default Vote_final;
