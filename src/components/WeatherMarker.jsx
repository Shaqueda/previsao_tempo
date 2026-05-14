import React from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { createRoot } from 'react-dom/client';
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudMoon, CloudRain, CloudSnow, CloudSun, Moon, Sun } from 'lucide-react';
import { getWeatherDescription } from '../services/weatherApi';

const WeatherIcon = ({ code, isDay }) => {
  const props = { size: 28, strokeWidth: 2 };
  
  if (code === 0) return isDay ? <Sun {...props} /> : <Moon {...props} />;
  if (code >= 1 && code <= 3) return isDay ? <CloudSun {...props} /> : <CloudMoon {...props} />;
  if (code >= 45 && code <= 48) return <CloudFog {...props} />;
  if (code >= 51 && code <= 55) return <CloudDrizzle {...props} />;
  if (code >= 61 && code <= 65) return <CloudRain {...props} />;
  if (code >= 71 && code <= 75) return <CloudSnow {...props} />;
  if (code >= 80 && code <= 82) return <CloudRain {...props} />;
  if (code >= 95 && code <= 99) return <CloudLightning {...props} />;
  
  return <Cloud {...props} />;
};

export const WeatherMarker = ({ city, onClick }) => {
  if (!city.weather) return null;

  const icon = React.useMemo(() => {
    const div = document.createElement('div');
    const root = createRoot(div);
    root.render(
      <div className="custom-weather-marker">
        <div className="weather-card">
          <div className="weather-icon-container">
            <WeatherIcon code={city.weather.code} isDay={city.weather.isDay} />
          </div>
          <div className="weather-info">
            <span className="city-name">{city.name}</span>
            <span className="temperature">{city.weather.temp}°</span>
            <span className="weather-desc">{getWeatherDescription(city.weather.code)}</span>
          </div>
        </div>
      </div>
    );
    
    // Fallback: Bind native DOM click event directly to the div
    div.addEventListener('click', () => {
      onClick(city);
    });
    
    return L.divIcon({
      html: div,
      className: '',
      iconSize: [160, 60],
      iconAnchor: [80, 30]
    });
  }, [city.name, city.weather.temp, city.weather.code]); // Only recreate if weather changes

  return (
    <Marker 
      position={[city.lat, city.lon]} 
      icon={icon} 
      eventHandlers={{ 
        click: () => onClick(city) 
      }}
    />
  );
};
