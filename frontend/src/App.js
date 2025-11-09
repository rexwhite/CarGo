import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);

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

  const handleRowClick = (car) => {
    setSelectedCar(car);
  };

  const handleBack = () => {
    setSelectedCar(null);
  };

  if (selectedCar) {
    return (
      <div className="App">
        <header className="App-header">
          <img src="/CarGo.png" alt="CarGo Logo" style={{ height: '100px', marginBottom: '10px' }} />
          <h1>CarGo</h1>
          <h2>Car Details</h2>
        </header>
        <main style={{ padding: '20px' }}>
          <button onClick={handleBack} className="back-button">
            ← Back to Cars
          </button>
          <div className="car-details-card">
            <h2>{selectedCar.name}</h2>
            <div className="car-details-info">
              <p><strong>Make:</strong> {selectedCar.make}</p>
              <p><strong>Model:</strong> {selectedCar.model}</p>
              <p><strong>Year:</strong> {selectedCar.year}</p>
              <p><strong>Mileage:</strong> {selectedCar.mileage.toLocaleString()} mi</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
          <table className="cars-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Make</th>
                <th>Model</th>
                <th>Year</th>
                <th>Mileage</th>
              </tr>
            </thead>
            <tbody>
              {cars.map(car => (
                <tr key={car.id} onClick={() => handleRowClick(car)}>
                  <td>{car.name}</td>
                  <td>{car.make}</td>
                  <td>{car.model}</td>
                  <td>{car.year}</td>
                  <td>{car.mileage.toLocaleString()} mi</td>
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
