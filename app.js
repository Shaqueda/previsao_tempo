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
    if (code === 1000) return isDay ? '☀️' : '🌙';
    if (code === 1003) return isDay ? '⛅' : '☁️';
    if (code === 1006 || code === 1009) return '☁️';
    if (code === 1030 || code === 1135 || code === 1147) return '🌫️';
    if ([1072, 1150, 1153, 1168, 1171].includes(code)) return '🌧️';
    if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) return isDay ? '🌦️' : '🌧️';
    if ([1087, 1273, 1276, 1279, 1282].includes(code)) return '⛈️';
    if (code > 1000) return '❄️';
    return '☁️';
}

function getWeatherDescription(code) {
    const codes = {
        1000: 'Céu Limpo',
        1003: 'Parcialmente Nublado',
        1006: 'Nublado',
        1009: 'Encoberto',
        1030: 'Névoa Úmida',
        1063: 'Possibilidade de Chuva',
        1066: 'Possibilidade de Neve',
        1069: 'Possibilidade de Granizo',
        1072: 'Garoa Gelada',
        1087: 'Possibilidade de Trovoada',
        1114: 'Vento com Neve',
        1117: 'Ventania com Neve',
        1135: 'Nevoeiro',
        1147: 'Nevoeiro Congelante',
        1150: 'Garoa Leve Intermitente',
        1153: 'Garoa Leve',
        1168: 'Garoa Congelante Leve',
        1171: 'Garoa Congelante Forte',
        1180: 'Chuva Leve Intermitente',
        1183: 'Chuva Leve',
        1186: 'Chuva Moderada Intermitente',
        1189: 'Chuva Moderada',
        1192: 'Chuva Forte Intermitente',
        1195: 'Chuva Forte',
        1198: 'Chuva Congelante Leve',
        1201: 'Chuva Congelante Forte',
        1204: 'Granizo Leve',
        1207: 'Granizo Forte',
        1210: 'Neve Leve Intermitente',
        1213: 'Neve Leve',
        1216: 'Neve Moderada Intermitente',
        1219: 'Neve Moderada',
        1222: 'Neve Forte Intermitente',
        1225: 'Neve Forte',
        1237: 'Granizo de Gelo',
        1240: 'Pancadas de Chuva Leves',
        1243: 'Pancadas de Chuva Moderadas/Fortes',
        1246: 'Pancadas de Chuva Torrentiais',
        1249: 'Pancadas de Granizo Leves',
        1252: 'Pancadas de Granizo Fortes',
        1255: 'Pancadas de Neve Leves',
        1258: 'Pancadas de Neve Fortes',
        1261: 'Pancadas de Chuva com Gelo Leves',
        1264: 'Pancadas de Chuva com Gelo Fortes',
        1273: 'Chuva Leve com Trovoadas',
        1276: 'Chuva Forte com Trovoadas',
        1279: 'Neve Leve com Trovoadas',
        1282: 'Neve Forte com Trovoadas'
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
    const key = localStorage.getItem('weather_api_key');
    if (!key) return;

    try {
        const fetchPromises = CITIES.map(async (city) => {
            try {
                const url = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${city.lat},${city.lon}&days=1&aqi=no&alerts=no`;
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to fetch for ${city.name}`);
                const data = await response.json();
                
                // Map WeatherAPI to Open-Meteo format for compatibility
                return {
                    cityId: city.id,
                    mapped: {
                        current: {
                            temperature_2m: data.current.temp_c,
                            is_day: data.current.is_day,
                            weather_code: data.current.condition.code,
                            wind_speed_10m: data.current.wind_kph
                        },
                        daily: {
                            precipitation_sum: [data.forecast.forecastday[0].day.totalprecip_mm]
                        },
                        hourly: {
                            temperature_2m: data.forecast.forecastday[0].hour.map(h => h.temp_c),
                            weather_code: data.forecast.forecastday[0].hour.map(h => h.condition.code),
                            is_day: data.forecast.forecastday[0].hour.map(h => h.is_day)
                        }
                    }
                };
            } catch (err) {
                console.error(`Erro ao carregar clima de ${city.name}:`, err);
                return null;
            }
        });

        const results = (await Promise.all(fetchPromises)).filter(r => r !== null);
        
        results.forEach(({ cityId, mapped }) => {
            const city = CITIES.find(c => c.id === cityId);
            const weather = mapped.current;

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
            marker.on('click', () => showCityDetails(city, mapped));
            
            markers[city.id] = marker;
        });
    } catch (error) {
        console.error("Error fetching weather:", error);
    }
}

// Interactivity functions
function showCityDetails(city, data) {
    const panel = document.getElementById('city-details-panel');
    const forecastPanel = document.getElementById('forecast-17-panel');
    
    // Reset animation by triggering reflow
    panel.style.animation = 'none';
    panel.offsetHeight; /* trigger reflow */
    panel.style.animation = null; 
    
    forecastPanel.style.animation = 'none';
    forecastPanel.offsetHeight;
    forecastPanel.style.animation = null;
    
    panel.style.display = 'flex';
    forecastPanel.style.display = 'flex';

    // Fly to the clicked city with a smooth zoom
    map.flyTo([city.lat, city.lon], 11, {
        duration: 1.5,
        easeLinearity: 0.25
    });

    // SITUAÇÃO ATUAL
    const currentTemp = Math.round(data.current.temperature_2m);
    const currentCode = data.current.weather_code;
    const currentIsDay = data.current.is_day;
    const currentWindSpeed = data.current.wind_speed_10m;
    const rainTotal = data.daily.precipitation_sum[0] || 0;

    document.getElementById('detail-city-name').textContent = city.name;
    document.getElementById('detail-temp').textContent = currentTemp + '°';
    document.getElementById('detail-desc').textContent = getWeatherDescription(currentCode);
    document.getElementById('detail-icon').textContent = getWeatherIcon(currentCode, currentIsDay);
    document.getElementById('detail-rain').textContent = rainTotal.toFixed(1).replace('.', ',') + ' mm';
    
    // Inject dynamic weather effects using CURRENT weather
    renderWeatherEffects(currentCode, currentWindSpeed);

    // PREVISÃO DAS 17H
    const hourIndex = 17;
    const temp17 = Math.round(data.hourly.temperature_2m[hourIndex]);
    const code17 = data.hourly.weather_code[hourIndex];
    const isDay17 = data.hourly.is_day[hourIndex];

    document.getElementById('forecast-17-temp').textContent = temp17 + '°';
    document.getElementById('forecast-17-desc').textContent = getWeatherDescription(code17);
    document.getElementById('forecast-17-icon').textContent = getWeatherIcon(code17, isDay17);
}

function closeDetails() {
    document.getElementById('city-details-panel').style.display = 'none';
    document.getElementById('forecast-17-panel').style.display = 'none';
    
    const overlay = document.getElementById('weather-effects-overlay');
    if (overlay) {
        overlay.innerHTML = '';
        overlay.classList.remove('active');
    }
    
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

function renderWeatherEffects(code, windSpeed) {
    const overlay = document.getElementById('weather-effects-overlay');
    if (!overlay) return;
    overlay.innerHTML = '';
    overlay.classList.remove('active');
    
    let html = '';
    
    // Chuva: 1063, 1150-1171, 1180-1201, 1240-1246, 1273-1276
    const isRainy = [1063, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246, 1273, 1276].includes(code);
    const isHeavyRain = [1192, 1195, 1243, 1246, 1276].includes(code);
    
    if (isRainy) {
        overlay.classList.add('active');
        const dropCount = isHeavyRain ? 100 : 40;
        let drops = '';
        for(let i=0; i<dropCount; i++) {
            const left = Math.random() * 100;
            const dur = 0.6 + Math.random() * 0.6;
            const del = Math.random() * 2;
            const height = 30 + Math.random() * 40;
            const opac = 0.15 + Math.random() * 0.3;
            drops += `<div class="rain-drop" style="left: ${left}%; animation-duration: ${dur}s; animation-delay: ${del}s; height: ${height}px; opacity: ${opac};"></div>`;
        }
        html += `<div class="rain-container">${drops}</div>`;
    }
    
    // Vento (Para testes fáceis, limite ajustado para > 5 km/h)
    if (windSpeed > 5) {
        overlay.classList.add('active');
        const lineCount = Math.min(Math.floor(windSpeed), 40);
        let lines = '';
        for(let i=0; i<lineCount; i++) {
            const top = Math.random() * 100;
            const dur = 0.8 + Math.random() * 1.5;
            const del = Math.random() * 3;
            const opac = 0.1 + Math.random() * 0.4;
            const width = 100 + Math.random() * 250;
            lines += `<div class="wind-line" style="top: ${top}%; animation-duration: ${dur}s; animation-delay: ${del}s; opacity: ${opac}; width: ${width}px;"></div>`;
        }
        html += `<div class="wind-container">${lines}</div>`;
    }
    
    // Trovoadas: 1087, 1273, 1276, 1279, 1282
    const isThunder = [1087, 1273, 1276, 1279, 1282].includes(code);
    if (isThunder) {
        overlay.classList.add('active');
        html += `<div class="lightning-container"><div class="lightning-flash"></div></div>`;
    }

    overlay.innerHTML = html;
}

// Lógica de Configurações de API Key
function openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const input = document.getElementById('api-key-input');
    if (modal && input) {
        input.value = localStorage.getItem('weather_api_key') || '';
        modal.style.display = 'flex';
    }
}

function closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function saveApiKey() {
    const input = document.getElementById('api-key-input');
    if (input) {
        const key = input.value.trim();
        if (key) {
            localStorage.setItem('weather_api_key', key);
        } else {
            localStorage.removeItem('weather_api_key');
        }
        closeSettingsModal();
        checkApiKeyAndFetch();
    }
}

function checkApiKeyAndFetch() {
    const key = localStorage.getItem('weather_api_key');
    const warning = document.getElementById('api-key-warning');
    if (!key) {
        if (warning) warning.style.display = 'block';
        return;
    }
    if (warning) warning.style.display = 'none';
    fetchWeatherData();
}

// Expor funções para escopo global para onclick inline no HTML
window.openSettingsModal = openSettingsModal;
window.closeSettingsModal = closeSettingsModal;
window.saveApiKey = saveApiKey;

// Inicialização
checkApiKeyAndFetch();
setInterval(checkApiKeyAndFetch, 5 * 60 * 1000); // Atualiza a cada 5 mins
