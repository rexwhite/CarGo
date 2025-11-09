import React, { useState, useEffect } from 'react';
import { Navbar, Container } from 'react-bootstrap';
import './App.css';

function App() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [maintenanceItems, setMaintenanceItems] = useState([]);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);

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

  useEffect(() => {
    if (selectedCar) {
      setLoadingMaintenance(true);
      fetch(`/api/maintenance-items/car/${selectedCar.id}`)
        .then(res => res.json())
        .then(data => {
          setMaintenanceItems(data);
          setLoadingMaintenance(false);
        })
        .catch(err => {
          console.error('Error fetching maintenance items:', err);
          setLoadingMaintenance(false);
        });
    }
  }, [selectedCar]);

  const handleRowClick = (car) => {
    setSelectedCar(car);
  };

  const handleBack = () => {
    setSelectedCar(null);
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-3" fixed="top">
        <Container fluid>
          <Navbar.Brand href="#home" onClick={handleBack} style={{ cursor: 'pointer' }}>
            <img
              src="/CarGo.png"
              height="40"
              className="d-inline-block align-top"
              alt="CarGo Logo"
            />
            {' '}
            CarGo
          </Navbar.Brand>
        </Container>
      </Navbar>

      <div className="App">

      {selectedCar ? (
        <>
          <header className="App-header">
            <h2>Car Details</h2>
          </header>
          <main style={{ padding: '20px' }}>
            <div className="car-details-card">
              <h2>{selectedCar.name}</h2>
              <div className="car-details-info">
                <p><strong>Make:</strong> {selectedCar.make}</p>
                <p><strong>Model:</strong> {selectedCar.model}</p>
                <p><strong>Year:</strong> {selectedCar.year}</p>
                <p><strong>Mileage:</strong> {selectedCar.mileage.toLocaleString()} mi</p>
              </div>
            </div>

            <div className="maintenance-section">
              <h3>Maintenance Items</h3>
              {loadingMaintenance ? (
                <p>Loading maintenance items...</p>
              ) : maintenanceItems.length === 0 ? (
                <p>No maintenance items found for this car.</p>
              ) : (
                <table className="maintenance-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Mileage Interval</th>
                      <th>Month Interval</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceItems.map(item => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.description || 'N/A'}</td>
                        <td>{item.mileage_interval ? `${item.mileage_interval.toLocaleString()} mi` : 'N/A'}</td>
                        <td>{item.month_interval ? `${item.month_interval} months` : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </main>
        </>
      ) : (
        <>
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
        </>
      )}
      </div>
    </>
  );
}

export default App;
