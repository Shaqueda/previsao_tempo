import React, { useEffect, useState } from 'react';
import { WeatherMap } from './components/WeatherMap';
import { CityInsights } from './components/CityInsights';
import { fetchWeatherForCities } from './services/weatherApi';

function App() {
  const [citiesData, setCitiesData] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    // Initial fetch
    loadData();

    // Refresh data every 5 minutes (for broadcast reliability)
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const data = await fetchWeatherForCities();
    if (data && data.length > 0) {
      setCitiesData(data);
      // Update selected city data if it's currently selected
      if (selectedCity) {
        const updated = data.find(c => c.id === selectedCity.id);
        if (updated) setSelectedCity(updated);
      }
    }
  };

  return (
    <div className="app-container">
      <WeatherMap cities={citiesData} onCitySelect={setSelectedCity} selectedCity={selectedCity} />
      
      {selectedCity && (
        <CityInsights city={selectedCity} onClose={() => setSelectedCity(null)} />
      )}
    </div>
  );
}

export default App;
