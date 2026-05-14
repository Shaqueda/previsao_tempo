export const CITIES = [
  { id: 'fortaleza', name: 'Fortaleza', lat: -3.7172, lon: -38.5431 },
  { id: 'sobral', name: 'Sobral', lat: -3.6896, lon: -40.3497 },
  { id: 'juazeiro', name: 'Juazeiro do Norte', lat: -7.2016, lon: -39.3142 },
  { id: 'iguatu', name: 'Iguatu', lat: -6.3592, lon: -39.2979 },
  { id: 'quixada', name: 'Quixadá', lat: -4.9715, lon: -39.0152 },
  { id: 'crateus', name: 'Crateús', lat: -5.1742, lon: -40.6775 },
];

export async function fetchWeatherForCities() {
  // Open-Meteo accepts multiple coordinates in a single request.
  const lats = CITIES.map(c => c.lat).join(',');
  const lons = CITIES.map(c => c.lon).join(',');
  
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m&timezone=America%2FFortaleza`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch weather data');
    const data = await response.json();
    
    // Map response back to cities
    return CITIES.map((city, index) => {
      // The API returns an array for multiple locations
      const locationData = Array.isArray(data) ? data[index] : data;
      const current = locationData.current;
      
      return {
        ...city,
        weather: {
          temp: Math.round(current.temperature_2m),
          humidity: current.relative_humidity_2m,
          windSpeed: current.wind_speed_10m,
          precipitation: current.precipitation,
          isDay: current.is_day,
          code: current.weather_code, // WMO code
        }
      };
    });
  } catch (error) {
    console.error("Error fetching weather:", error);
    return [];
  }
}

// WMO Weather interpretation codes (https://open-meteo.com/en/docs)
export function getWeatherDescription(code) {
  const codes = {
    0: 'Céu Limpo',
    1: 'Predominantemente Limpo',
    2: 'Parcialmente Nublado',
    3: 'Nublado',
    45: 'Nevoeiro',
    48: 'Nevoeiro com geada',
    51: 'Garoa leve',
    53: 'Garoa moderada',
    55: 'Garoa forte',
    61: 'Chuva leve',
    63: 'Chuva moderada',
    65: 'Chuva forte',
    71: 'Neve leve',
    73: 'Neve moderada',
    75: 'Neve forte',
    80: 'Pancadas de chuva leves',
    81: 'Pancadas de chuva moderadas',
    82: 'Pancadas de chuva fortes',
    95: 'Trovoada',
    96: 'Trovoada com granizo leve',
    99: 'Trovoada com granizo forte'
  };
  return codes[code] || 'Desconhecido';
}
