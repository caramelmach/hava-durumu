// Open-Meteo: ücretsiz, API anahtarı gerektirmez — https://open-meteo.com

export interface Place {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export interface Forecast {
  current: {
    temperature: number;
    apparent: number;
    humidity: number;
    wind: number;
    code: number;
    isDay: boolean;
  };
  daily: { date: string; max: number; min: number; code: number; rain: number }[];
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', query);
  url.searchParams.set('count', '6');
  url.searchParams.set('language', 'tr');
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error('Şehir araması başarısız');
  const data = await res.json();
  return data.results ?? [];
}

export async function getForecast(lat: number, lon: number): Promise<Forecast> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set(
    'current',
    'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day',
  );
  url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '7');

  const res = await fetch(url);
  if (!res.ok) throw new Error('Hava durumu alınamadı');
  const d = await res.json();

  return {
    current: {
      temperature: d.current.temperature_2m,
      apparent: d.current.apparent_temperature,
      humidity: d.current.relative_humidity_2m,
      wind: d.current.wind_speed_10m,
      code: d.current.weather_code,
      isDay: d.current.is_day === 1,
    },
    daily: d.daily.time.map((date: string, i: number) => ({
      date,
      max: d.daily.temperature_2m_max[i],
      min: d.daily.temperature_2m_min[i],
      code: d.daily.weather_code[i],
      rain: d.daily.precipitation_probability_max[i] ?? 0,
    })),
  };
}

// WMO hava kodları
export function describe(code: number, isDay = true): { text: string; icon: string } {
  if (code === 0) return { text: 'Açık', icon: isDay ? '☀️' : '🌙' };
  if (code <= 2) return { text: 'Parçalı bulutlu', icon: isDay ? '⛅' : '☁️' };
  if (code === 3) return { text: 'Kapalı', icon: '☁️' };
  if (code <= 48) return { text: 'Sisli', icon: '🌫️' };
  if (code <= 57) return { text: 'Çisenti', icon: '🌦️' };
  if (code <= 67) return { text: 'Yağmurlu', icon: '🌧️' };
  if (code <= 77) return { text: 'Karlı', icon: '❄️' };
  if (code <= 82) return { text: 'Sağanak', icon: '🌧️' };
  if (code <= 86) return { text: 'Kar sağanağı', icon: '🌨️' };
  return { text: 'Gök gürültülü fırtına', icon: '⛈️' };
}
