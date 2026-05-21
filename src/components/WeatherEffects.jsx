import React, { useMemo } from 'react';
import './WeatherEffects.css';

export const WeatherEffects = ({ weather }) => {
  if (!weather) return null;

  const { code, windSpeed } = weather;
  
  // WeatherAPI weather condition codes
  // Rain: 1063, 1150-1171, 1180-1201, 1240-1246, 1273-1276
  const isRainy = [1063, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246, 1273, 1276].includes(code);
  const isHeavyRain = [1192, 1195, 1243, 1246, 1276].includes(code);
  
  // Snow: 1066, 1069, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264, 1279, 1282
  const isSnowy = [1066, 1069, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264, 1279, 1282].includes(code);
  
  // Thunderstorm: 1087, 1273, 1276, 1279, 1282
  const isThunderstorm = [1087, 1273, 1276, 1279, 1282].includes(code);
  
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
