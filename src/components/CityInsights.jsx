import React from 'react';
import { ArrowLeft, Droplets, Wind, CloudRain } from 'lucide-react';
import { getWeatherDescription } from '../services/weatherApi';

export const CityInsights = ({ city, onClose }) => {
  if (!city) return null;

  return (
    <div className="insights-panel">
      <button className="back-btn" onClick={onClose}>
        <ArrowLeft size={24} />
        <span>Voltar ao Mapa</span>
      </button>

      <div className="insights-header">
        <h1 className="insights-city">{city.name}</h1>
        <p className="insights-desc">{getWeatherDescription(city.weather.code)}</p>
      </div>

      <div className="insights-main-temp">
        {city.weather.temp}°
      </div>

      <div className="insights-stats-grid">
        <div className="insight-stat">
          <Droplets className="stat-icon" size={24} />
          <div className="stat-info">
            <span className="stat-label">Umidade</span>
            <span className="stat-value">{city.weather.humidity}%</span>
          </div>
        </div>
        <div className="insight-stat">
          <Wind className="stat-icon" size={24} />
          <div className="stat-info">
            <span className="stat-label">Vento</span>
            <span className="stat-value">{city.weather.windSpeed} km/h</span>
          </div>
        </div>
        <div className="insight-stat">
          <CloudRain className="stat-icon" size={24} />
          <div className="stat-info">
            <span className="stat-label">Chuva</span>
            <span className="stat-value">{city.weather.precipitation} mm</span>
          </div>
        </div>
      </div>
    </div>
  );
};
