import React, { useEffect, useState } from 'react';
import { WeatherMap } from './components/WeatherMap';
import { fetchWeatherForCities } from './services/weatherApi';

function App() {
  const [citiesData, setCitiesData] = useState([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Initial fetch
    loadData();

    // Refresh data every 5 minutes (for broadcast reliability)
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update clock every second
    const clockInterval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const loadData = async () => {
    const data = await fetchWeatherForCities();
    if (data && data.length > 0) {
      setCitiesData(data);
    }
  };

  return (
    <div className="app-container">
      <WeatherMap cities={citiesData} />
      
      {/* Broadcast Sidebar Overlay */}
      <div className="sidebar">
        <h1>Tempo Agora</h1>
        <h2>Ceará</h2>
        
        <div className="time-display">
          {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="date-display">
          {time.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
        </div>
      </div>
    </div>
  );
}

export default App;
