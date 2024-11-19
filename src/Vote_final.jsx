import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSocket } from './SocketContext';
import './styleFiles/Vote_final.css'; // Create this CSS file for styling

const Vote_final = () => {
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const socket = useSocket(); // Adjust URL if necessary

  useEffect(() => {
    // Listen for 'vote-results' event from the server
    socket.on('vote-results', (data) => {
      const d = data.map(d => {return {restName: d, voteCount: Math.floor(Math.random() * 4)}})
      const resData = d.sort((a, b) => b.voteCount - a.voteCount)

      console.log(resData)
      setResults(resData);
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
          {results.map((result, index) => (
            <div className="result-card" key={index}>
              <h2>{index + 1}. {result.restName}</h2>
              <p>Votes: {result.voteCount}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading results...</p>
      )}
    </div>
  );
};

export default Vote_final;
