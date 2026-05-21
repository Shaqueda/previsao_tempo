export const CITIES = [
  { id: 'fortaleza', name: 'Fortaleza', lat: -3.7172, lon: -38.5431 },
  { id: 'sobral', name: 'Sobral', lat: -3.6896, lon: -40.3497 },
  { id: 'juazeiro', name: 'Juazeiro do Norte', lat: -7.2016, lon: -39.3142 },
  { id: 'iguatu', name: 'Iguatu', lat: -6.3592, lon: -39.2979 },
  { id: 'quixada', name: 'Quixadá', lat: -4.9715, lon: -39.0152 },
  { id: 'crateus', name: 'Crateús', lat: -5.1742, lon: -40.6775 },
];

export async function fetchWeatherForCities() {
  const key = localStorage.getItem('weather_api_key');
  if (!key) {
    console.warn("WeatherAPI key is missing in localStorage");
    return [];
  }

  try {
    const fetchPromises = CITIES.map(async (city) => {
      try {
        const url = `https://api.weatherapi.com/v1/current.json?key=${key}&q=${city.lat},${city.lon}&aqi=no`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch for ${city.name}`);
        const data = await response.json();
        
        return {
          ...city,
          weather: {
            temp: Math.round(data.current.temp_c),
            humidity: data.current.humidity,
            windSpeed: data.current.wind_kph,
            precipitation: data.current.precip_mm,
            isDay: data.current.is_day,
            code: data.current.condition.code,
          }
        };
      } catch (err) {
        console.error(`Erro ao carregar clima de ${city.name}:`, err);
        return null;
      }
    });

    return (await Promise.all(fetchPromises)).filter(r => r !== null);
  } catch (error) {
    console.error("Error fetching weather:", error);
    return [];
  }
}

// WeatherAPI condition codes translation to Portuguese
export function getWeatherDescription(code) {
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
