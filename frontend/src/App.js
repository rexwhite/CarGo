import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/hello')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => console.error('Error fetching from backend:', err));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚗 CarGo</h1>
        <h2>Automotive Maintenance Tracker</h2>
        <p>{message || 'Loading...'}</p>
      </header>
    </div>
  );
}

export default App;
