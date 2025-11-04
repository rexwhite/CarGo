import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cars')
      .then(res => res.json())
      .then(data => {
        setCars(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching cars:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src="/CarGo.png" alt="CarGo Logo" style={{ height: '100px', marginBottom: '10px' }} />
        <h1>CarGo</h1>
        <h2>Automotive Maintenance Tracker</h2>
      </header>
      <main style={{ padding: '20px' }}>
        {loading ? (
          <p>Loading cars...</p>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '20px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#282c34', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Make</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Model</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Year</th>
                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Mileage</th>
              </tr>
            </thead>
            <tbody>
              {cars.map(car => (
                <tr key={car.id}>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{car.name}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{car.make}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{car.model}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{car.year}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{car.mileage.toLocaleString()} mi</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

export default App;
