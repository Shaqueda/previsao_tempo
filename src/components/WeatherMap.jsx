import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { WeatherMarker } from './WeatherMarker';

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

const CEARA_BOUNDS = [
  [-2.78, -41.42], // Northwest
  [-7.86, -37.25]  // Southeast
];

const MapEffects = ({ selectedCity }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedCity) {
      // Zoom in to the city, slightly offset to the left so the center is visible next to panel
      map.flyTo([selectedCity.lat, selectedCity.lon], 11, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    } else {
      // Zoom out to state bounds
      map.flyToBounds(CEARA_BOUNDS, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, [selectedCity, map]);

  return null;
};

export const WeatherMap = ({ cities, onCitySelect, selectedCity }) => {
  const [cearaCoords, setCearaCoords] = useState(null);

  useEffect(() => {
    fetch('https://servicodados.ibge.gov.br/api/v3/malhas/estados/CE?formato=application/vnd.geo+json')
      .then(res => res.json())
      .then(data => {
        const coords = data.features[0].geometry.coordinates[0].map(
          ([lng, lat]) => [lat, lng]
        );
        setCearaCoords(coords);
      });
  }, []);

  // Bounding box covering Brazil/South America, avoiding globe-wrapping glitches
  const outerCoords = [
    [15, -85],
    [15, -25],
    [-40, -25],
    [-40, -85],
    [15, -85]
  ];

  return (
    <div className="map-container">
      <MapContainer 
        bounds={CEARA_BOUNDS}
        zoomControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        dragging={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <MapEffects selectedCity={selectedCity} />
        <TileLayer
          url={TILE_URL}
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        {cearaCoords && (
          <Polygon 
            positions={[outerCoords, cearaCoords]}
            pathOptions={{ 
              color: 'transparent', 
              fillColor: '#0b0f19', 
              fillOpacity: 1,
              fillRule: 'evenodd'
            }} 
          />
        )}
        {cities.map((city) => (
          <WeatherMarker key={city.id} city={city} onClick={() => onCitySelect(city)} />
        ))}
      </MapContainer>
    </div>
  );
};
