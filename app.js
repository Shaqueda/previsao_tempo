const CITIES = [
    { id: 'fortaleza', name: 'Fortaleza', lat: -3.7172, lon: -38.5431 },
    { id: 'sobral', name: 'Sobral', lat: -3.6896, lon: -40.3497 },
    { id: 'juazeiro', name: 'Juazeiro', lat: -7.2016, lon: -39.3142 },
    { id: 'iguatu', name: 'Iguatu', lat: -6.3592, lon: -39.2979 },
    { id: 'quixada', name: 'Quixadá', lat: -4.9715, lon: -39.0152 },
    { id: 'crateus', name: 'Crateús', lat: -5.1742, lon: -40.6775 },
    { id: 'itapipoca', name: 'Itapipoca', lat: -3.4944, lon: -39.5786 },
    { id: 'aracati', name: 'Aracati', lat: -4.5619, lon: -37.7667 },
    { id: 'tiangua', name: 'Tianguá', lat: -3.7317, lon: -40.9903 }
];

// Initialize Map
const map = L.map('map', {
    zoomControl: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    dragging: false,
    zoomSnap: 0.1 // Allows very precise automatic zooming
}).setView([-5.3, -39.3], 7); // Default view before bounds are calculated

// Add Dark Theme Tile Layer (no labels for cleaner look)
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
}).addTo(map);

// Global variable to store Ceará bounds for zooming back
let cearaStateBounds;

// Draw Ceará borders using IBGE API to highlight the state
fetch('https://servicodados.ibge.gov.br/api/v3/malhas/estados/CE?formato=application/vnd.geo+json')
    .then(response => response.json())
    .then(data => {
        // Extract coordinates and convert from [lng, lat] to [lat, lng]
        const cearaCoords = data.features[0].geometry.coordinates[0].map(
            ([lng, lat]) => [lat, lng]
        );
        
        // Bounding box covering Brazil/South America
        const outerCoords = [
            [15, -85],
            [15, -25],
            [-40, -25],
            [-40, -85],
            [15, -85]
        ];

        // Draw inverted polygon to hide everything outside Ceará
        L.polygon([outerCoords, cearaCoords], {
            color: '#38bdf8', // Vibrant sky blue border for the state hole
            weight: 3,
            fillColor: '#0b0f19', // Matches background
            fillOpacity: 1,
            fillRule: 'evenodd'
        }).addTo(map);
        
        // Calculate the actual bounds of Ceará and fit the map
        cearaStateBounds = L.latLngBounds(cearaCoords);
        map.fitBounds(cearaStateBounds, { padding: [20, 20] });
    });

// Keep track of markers to update them
const markers = {};

function getWeatherIcon(code, isDay) {
    if (code === 0) return isDay ? '☀️' : '🌙';
    if (code >= 1 && code <= 3) return isDay ? '⛅' : '☁️';
    if (code >= 45 && code <= 48) return '🌫️';
    if (code >= 51 && code <= 55) return '🌧️';
    if (code >= 61 && code <= 65) return '🌦️';
    if (code >= 71 && code <= 75) return '❄️';
    if (code >= 80 && code <= 82) return '🌧️';
    if (code >= 95 && code <= 99) return '⛈️';
    return '☁️';
}

function getWeatherDescription(code) {
    const codes = {
      0: 'Céu Limpo',
      1: 'Predom. Limpo',
      2: 'Parc. Nublado',
      3: 'Nublado',
      45: 'Nevoeiro',
      48: 'Nevoeiro',
      51: 'Garoa leve',
      53: 'Garoa',
      55: 'Garoa forte',
      61: 'Chuva leve',
      63: 'Chuva',
      65: 'Chuva forte',
      71: 'Neve leve',
      73: 'Neve',
      75: 'Neve forte',
      80: 'Pancadas leves',
      81: 'Pancadas chuva',
      82: 'Pancadas fortes',
      95: 'Trovoada',
      96: 'Trovoada/Granizo',
      99: 'Trovoada/Granizo'
    };
    return codes[code] || 'Desconhecido';
}

function createMarkerHTML(city, weather) {
    const icon = getWeatherIcon(weather.weather_code, weather.is_day);
    const desc = getWeatherDescription(weather.weather_code);
    const temp = Math.round(weather.temperature_2m);

    return `
        <div class="custom-weather-marker">
            <div class="weather-card">
                <div class="weather-icon-container">${icon}</div>
                <div class="weather-info">
                    <span class="city-name">${city.name}</span>
                    <span class="temperature">${temp}°</span>
                    <span class="weather-desc">${desc}</span>
                </div>
            </div>
        </div>
    `;
}

async function fetchWeatherData() {
    try {
        const lats = CITIES.map(c => c.lat).join(',');
        const lons = CITIES.map(c => c.lon).join(',');
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,is_day,weather_code&hourly=temperature_2m,weather_code,precipitation,is_day&daily=precipitation_sum&timezone=America%2FFortaleza`;

        const response = await fetch(url);
        const data = await response.json();

        CITIES.forEach((city, index) => {
            const locationData = Array.isArray(data) ? data[index] : data;
            const weather = locationData.current;

            if (markers[city.id]) {
                map.removeLayer(markers[city.id]);
            }

            const customIcon = L.divIcon({
                html: createMarkerHTML(city, weather),
                className: '',
                iconSize: [140, 60],
                iconAnchor: [70, 30]
            });

            const marker = L.marker([city.lat, city.lon], { icon: customIcon }).addTo(map);
            
            // Add click event for details panel
            marker.on('click', () => showCityDetails(city, locationData));
            
            markers[city.id] = marker;
        });
    } catch (error) {
        console.error("Error fetching weather:", error);
    }
}

// Interactivity functions
function showCityDetails(city, data) {
    const panel = document.getElementById('city-details-panel');
    
    // Reset animation by triggering reflow
    panel.style.animation = 'none';
    panel.offsetHeight; /* trigger reflow */
    panel.style.animation = null; 
    
    panel.style.display = 'flex';

    // Fly to the clicked city with a smooth zoom
    map.flyTo([city.lat, city.lon], 11, {
        duration: 1.5,
        easeLinearity: 0.25
    });

    // Index 17 represents 17:00 of the first returned day (today)
    const hourIndex = 17;
    
    const temp17 = Math.round(data.hourly.temperature_2m[hourIndex]);
    const code17 = data.hourly.weather_code[hourIndex];
    const isDay17 = data.hourly.is_day[hourIndex];
    const rainTotal = data.daily.precipitation_sum[0] || 0;

    document.getElementById('detail-city-name').textContent = city.name;
    document.getElementById('detail-temp').textContent = temp17 + '°';
    document.getElementById('detail-desc').textContent = getWeatherDescription(code17);
    document.getElementById('detail-icon').textContent = getWeatherIcon(code17, isDay17);
    document.getElementById('detail-rain').textContent = rainTotal.toFixed(1).replace('.', ',') + ' mm';
}

function closeDetails() {
    document.getElementById('city-details-panel').style.display = 'none';
    
    // Fly back to show the entire state
    if (cearaStateBounds) {
        map.flyToBounds(cearaStateBounds, {
            padding: [20, 20],
            duration: 1.5,
            easeLinearity: 0.25
        });
    }
}
// Expose for inline HTML onclick
window.closeDetails = closeDetails;

// Initialize
fetchWeatherData();
setInterval(fetchWeatherData, 5 * 60 * 1000); // Update every 5 mins
