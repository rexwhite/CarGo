// noinspection CheckImageSize

import React, { useState, useEffect } from 'react';
import { Navbar, Container } from 'react-bootstrap';
import './App.css';

function App() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [serviceItems, setServiceItems] = useState([]);
  const [loadingService, setLoadingService] = useState(false);
  const [serviceEvents, setServiceEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

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
      setLoadingService(true);
      fetch(`/api/service-items/car/${selectedCar.id}`)
        .then(res => res.json())
        .then(data => {
          setServiceItems(data);
          setLoadingService(false);

          // Fetch service events for all service items
          setLoadingEvents(true);
          const eventPromises = data.map(item =>
            fetch(`/api/service-events/service-item/${item.id}`)
              .then(res => res.json())
              .then(events => events.map(event => ({ ...event, service_item_title: item.title })))
          );

          Promise.all(eventPromises)
            .then(allEvents => {
              const flatEvents = allEvents.flat().sort((a, b) => new Date(b.date) - new Date(a.date));
              setServiceEvents(flatEvents);
              setLoadingEvents(false);
            })
            .catch(err => {
              console.error('Error fetching service events:', err);
              setLoadingEvents(false);
            });
        })
        .catch(err => {
          console.error('Error fetching service items:', err);
          setLoadingService(false);
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

            <div className="service-section">
              <h3>Service Items</h3>
              {loadingService ? (
                <p>Loading service items...</p>
              ) : serviceItems.length === 0 ? (
                <p>No service items found for this car.</p>
              ) : (
                <table className="service-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Mileage Interval</th>
                      <th>Month Interval</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceItems.map(item => (
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

            <div className="service-section">
              <h3>Service History</h3>
              {loadingEvents ? (
                <p>Loading service history...</p>
              ) : serviceEvents.length === 0 ? (
                <p>No service history found for this car.</p>
              ) : (
                <table className="service-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Service</th>
                      <th>Mileage</th>
                      <th>Performed By</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceEvents.map(event => (
                      <tr key={event.id}>
                        <td>{new Date(event.date).toLocaleDateString()}</td>
                        <td>{event.service_item_title}</td>
                        <td>{event.mileage.toLocaleString()} mi</td>
                        <td>{event.performed_by || 'N/A'}</td>
                        <td>{event.notes || 'N/A'}</td>
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
