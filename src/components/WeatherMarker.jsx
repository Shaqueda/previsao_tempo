import React from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { createRoot } from 'react-dom/client';
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudMoon, CloudRain, CloudSnow, CloudSun, Moon, Sun } from 'lucide-react';
import { getWeatherDescription } from '../services/weatherApi';

const WeatherIcon = ({ code, isDay }) => {
  const props = { size: 28, strokeWidth: 2 };
  
  if (code === 1000) return isDay ? <Sun {...props} /> : <Moon {...props} />;
  if (code === 1003) return isDay ? <CloudSun {...props} /> : <CloudMoon {...props} />;
  if (code === 1006 || code === 1009) return <Cloud {...props} />;
  if (code === 1030 || code === 1135 || code === 1147) return <CloudFog {...props} />;
  if ([1072, 1150, 1153, 1168, 1171].includes(code)) return <CloudDrizzle {...props} />;
  if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) return <CloudRain {...props} />;
  if ([1087, 1273, 1276, 1279, 1282].includes(code)) return <CloudLightning {...props} />;
  if (code > 1000) return <CloudSnow {...props} />;
  
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
