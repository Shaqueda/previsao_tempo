import React, { useMemo } from 'react';
import './WeatherEffects.css';

export const WeatherEffects = ({ weather }) => {
  if (!weather) return null;

  const { code, windSpeed } = weather;
  
  // WMO Weather interpretation codes
  // Rain: 51-55 (Drizzle), 61-65 (Rain), 80-82 (Showers)
  const isRainy = (code >= 51 && code <= 67) || (code >= 80 && code <= 82);
  const isHeavyRain = code === 55 || code === 65 || code === 82 || (code >= 95 && code <= 99);
  
  // Snow: 71-77 (Snow), 85-86 (Snow showers)
  const isSnowy = (code >= 71 && code <= 77) || (code >= 85 && code <= 86);
  
  // Thunderstorm: 95-99
  const isThunderstorm = code >= 95 && code <= 99;
  
  // Wind: Lowered threshold to 5 km/h just so you can see the effect easily right now!
  const isWindy = windSpeed > 5; 

  return (
    <div className="weather-effects-overlay">
      {isRainy && <RainEffects intensity={isHeavyRain ? 'heavy' : 'light'} />}
      {isSnowy && <SnowEffects />}
      {isWindy && <WindEffects speed={windSpeed} />}
      {isThunderstorm && <LightningEffects />}
    </div>
  );
};

const RainEffects = React.memo(({ intensity }) => {
  const dropCount = intensity === 'heavy' ? 150 : 60;
  
  const drops = useMemo(() => {
    return Array.from({ length: dropCount }).map((_, i) => ({
      left: `${Math.random() * 100}%`,
      animationDuration: `${0.4 + Math.random() * 0.4}s`,
      animationDelay: `${Math.random() * 2}s`,
      height: `${60 + Math.random() * 60}px`,
      opacity: 0.3 + Math.random() * 0.5
    }));
  }, [dropCount]);

  return (
    <div className="rain-container">
      {drops.map((style, i) => (
        <div key={i} className="rain-drop" style={style}></div>
      ))}
    </div>
  );
});

const WindEffects = React.memo(({ speed }) => {
  // Map wind speed to line count (more wind = more lines)
  const lineCount = Math.min(Math.floor(speed), 40);
  
  const lines = useMemo(() => {
    return Array.from({ length: lineCount }).map((_, i) => ({
      top: `${Math.random() * 100}%`,
      animationDuration: `${0.8 + Math.random() * 1.5}s`,
      animationDelay: `${Math.random() * 3}s`,
      opacity: 0.1 + Math.random() * 0.4,
      width: `${100 + Math.random() * 250}px`
    }));
  }, [lineCount]);

  return (
    <div className="wind-container">
      {lines.map((style, i) => (
        <div key={i} className="wind-line" style={style}></div>
      ))}
    </div>
  );
});

const LightningEffects = React.memo(() => {
  return (
    <div className="lightning-container">
      <div className="lightning-flash"></div>
    </div>
  );
});

const SnowEffects = React.memo(() => {
  const flakeCount = 80;
  
  const flakes = useMemo(() => {
    return Array.from({ length: flakeCount }).map((_, i) => ({
      left: `${Math.random() * 100}%`,
      animationDuration: `${4 + Math.random() * 6}s`,
      animationDelay: `${Math.random() * 5}s`,
      opacity: 0.3 + Math.random() * 0.7,
      width: `${3 + Math.random() * 6}px`,
      height: `${3 + Math.random() * 6}px`
    }));
  }, [flakeCount]);

  return (
    <div className="snow-container">
      {flakes.map((style, i) => (
        <div key={i} className="snow-flake" style={style}></div>
      ))}
    </div>
  );
});
