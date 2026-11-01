import { useEffect, useState } from 'react'
import { describe, getForecast, type Forecast, type Place } from './api'
import SearchBox from './SearchBox'

const DEFAULT_PLACE: Place = {
  id: 0,
  name: 'İzmit',
  country: 'Türkiye',
  admin1: 'Kocaeli',
  latitude: 40.7654,
  longitude: 29.9408,
}
const STORAGE_KEY = 'hava-durumu/place'

function loadPlace(): Place {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_PLACE
  } catch {
    return DEFAULT_PLACE
  }
}

function dayName(iso: string, index: number) {
  if (index === 0) return 'Bugün'
  return new Date(iso).toLocaleDateString('tr-TR', { weekday: 'short' })
}

export default function App() {
  const [place, setPlace] = useState<Place>(loadPlace)
  const [forecast, setForecast] = useState<Forecast | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setError(null)
    getForecast(place.latitude, place.longitude)
      .then((f) => !cancelled && setForecast(f))
      .catch((e: Error) => !cancelled && setError(e.message))
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(place))
    } catch {
      /* gizli sekmede localStorage olmayabilir */
    }
    return () => {
      cancelled = true
    }
  }, [place])

  const current = forecast && describe(forecast.current.code, forecast.current.isDay)
  const weekMin = forecast ? Math.min(...forecast.daily.map((d) => d.min)) : 0
  const weekMax = forecast ? Math.max(...forecast.daily.map((d) => d.max)) : 0

  return (
    <main className="app">
      <SearchBox onSelect={setPlace} />

      <section className="current">
        <p className="place">
          {place.name}
          <span>{[place.admin1, place.country].filter(Boolean).join(', ')}</span>
        </p>
        {error && <p className="error">{error}</p>}
        {forecast && current && (
          <>
            <div className="big">
              <span className="icon">{current.icon}</span>
              <span className="temp">{Math.round(forecast.current.temperature)}°</span>
            </div>
            <p className="desc">{current.text}</p>
            <div className="stats">
              <div>
                <span>Hissedilen</span>
                <strong>{Math.round(forecast.current.apparent)}°</strong>
              </div>
              <div>
                <span>Nem</span>
                <strong>%{forecast.current.humidity}</strong>
              </div>
              <div>
                <span>Rüzgar</span>
                <strong>{Math.round(forecast.current.wind)} km/s</strong>
              </div>
            </div>
          </>
        )}
        {!forecast && !error && <p className="loading">Yükleniyor…</p>}
      </section>

      {forecast && (
        <section className="week">
          <h2>7 günlük tahmin</h2>
          <ul>
            {forecast.daily.map((d, i) => {
              const info = describe(d.code)
              const range = weekMax - weekMin || 1
              return (
                <li key={d.date}>
                  <span className="day">{dayName(d.date, i)}</span>
                  <span className="dicon" title={info.text}>
                    {info.icon}
                  </span>
                  <span className="rain">{d.rain > 20 ? `💧${d.rain}%` : ''}</span>
                  <span className="min">{Math.round(d.min)}°</span>
                  <span className="track">
                    <span
                      className="fill"
                      style={{
                        left: `${((d.min - weekMin) / range) * 100}%`,
                        right: `${((weekMax - d.max) / range) * 100}%`,
                      }}
                    />
                  </span>
                  <span className="max">{Math.round(d.max)}°</span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <footer>
        Veriler <a href="https://open-meteo.com">Open-Meteo</a>'dan alınır.
      </footer>
    </main>
  )
}
