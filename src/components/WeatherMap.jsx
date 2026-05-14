import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { WeatherMarker } from './WeatherMarker';

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

export const WeatherMap = ({ cities }) => {
  return (
    <div className="map-container">
      <MapContainer 
        center={[-5.5, -39.5]} 
        zoom={7} 
        zoomControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        dragging={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url={TILE_URL}
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        {cities.map((city) => (
          <WeatherMarker key={city.id} city={city} />
        ))}
      </MapContainer>
    </div>
  );
};
