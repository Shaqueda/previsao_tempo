import React, { useEffect, useState } from 'react';
import { WeatherMap } from './components/WeatherMap';
import { CityInsights } from './components/CityInsights';
import { WeatherEffects } from './components/WeatherEffects';
import { fetchWeatherForCities } from './services/weatherApi';

function App() {
  const [citiesData, setCitiesData] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [apiKey, setApiKey] = useState(localStorage.getItem('weather_api_key') || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputKey, setInputKey] = useState('');

  const loadData = async () => {
    const key = localStorage.getItem('weather_api_key');
    if (!key) {
      setCitiesData([]);
      return;
    }
    const data = await fetchWeatherForCities();
    if (data && data.length > 0) {
      setCitiesData(data);
      // Update selected city data if it's currently selected
      if (selectedCity) {
        const updated = data.find(c => c.id === selectedCity.id);
        if (updated) setSelectedCity(updated);
      }
    } else {
      setCitiesData([]);
    }
  };

  useEffect(() => {
    loadData();

    // Refresh data every 5 minutes (for broadcast reliability)
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [apiKey]);

  const handleOpenModal = () => {
    setInputKey(localStorage.getItem('weather_api_key') || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveKey = () => {
    const trimmed = inputKey.trim();
    if (trimmed) {
      localStorage.setItem('weather_api_key', trimmed);
      setApiKey(trimmed);
    } else {
      localStorage.removeItem('weather_api_key');
      setApiKey('');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="app-container">
      <WeatherMap cities={citiesData} onCitySelect={setSelectedCity} selectedCity={selectedCity} />
      
      {selectedCity && <WeatherEffects weather={selectedCity.weather} />}
      
      {selectedCity && (
        <CityInsights city={selectedCity} onClose={() => setSelectedCity(null)} />
      )}

      {/* API Key Settings Button */}
      <button 
        id="settings-trigger-btn" 
        className="settings-trigger-btn" 
        onClick={handleOpenModal}
      >
        ⚙️
      </button>

      {/* API Key Settings Modal */}
      {isModalOpen && (
        <div id="settings-modal" className="settings-modal">
          <div className="modal-content">
            <h3>Configuração de API</h3>
            <p>
              Insira sua chave do{' '}
              <a 
                href="https://www.weatherapi.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ color: 'var(--accent-color)' }}
              >
                WeatherAPI.com
              </a>{' '}
              para obter dados em tempo real.
            </p>
            <input 
              type="password" 
              id="api-key-input" 
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Cole sua API Key aqui..." 
            />
            <div className="modal-actions">
              <button className="save-btn" onClick={handleSaveKey}>Salvar</button>
              <button className="cancel-btn" onClick={handleCloseModal}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Banner if API Key is missing */}
      {!apiKey && (
        <div 
          id="api-key-warning" 
          className="api-key-warning" 
          onClick={handleOpenModal}
        >
          <span>⚠️ API Key necessária para tempo real. Clique aqui para configurar.</span>
        </div>
      )}
    </div>
  );
}

export default App;
