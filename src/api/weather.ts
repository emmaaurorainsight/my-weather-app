import type { WeatherData, ForecastDay } from '../types/weather'

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY
const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct'
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather'
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast'

async function geocode(city: string): Promise<{ lat: number; lon: number; name: string; country: string }> {
  const url = `${GEO_URL}?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to reach the weather service. Please try again.')

  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`City "${city}" not found. Please check the spelling and try again.`)
  }

  return { lat: data[0].lat, lon: data[0].lon, name: data[0].name, country: data[0].country }
}

function groupForecastByDay(list: Array<{
  dt_txt: string
  main: { temp_min: number; temp_max: number }
  weather: Array<{ description: string; icon: string }>
}>): ForecastDay[] {
  const today = new Date().toISOString().slice(0, 10)
  const byDay = new Map<string, typeof list>()

  for (const entry of list) {
    const date = entry.dt_txt.slice(0, 10)
    if (date === today) continue  // skip today — covered by current weather
    if (!byDay.has(date)) byDay.set(date, [])
    byDay.get(date)!.push(entry)
  }

  const days: ForecastDay[] = []
  for (const [date, entries] of byDay) {
    if (days.length >= 5) break

    const tempMin = Math.round(Math.min(...entries.map(e => e.main.temp_min)))
    const tempMax = Math.round(Math.max(...entries.map(e => e.main.temp_max)))

    // Use the noon entry for the representative icon/condition, fallback to first
    const noon = entries.find(e => e.dt_txt.includes('12:00:00')) ?? entries[0]

    days.push({
      date,
      tempMin,
      tempMax,
      condition: noon.weather[0].description,
      icon: noon.weather[0].icon,
    })
  }

  return days
}

export async function fetchWeather(city: string): Promise<WeatherData> {
  const { lat, lon, name, country } = await geocode(city)

  const [weatherRes, forecastRes] = await Promise.all([
    fetch(`${WEATHER_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
    fetch(`${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
  ])

  if (!weatherRes.ok || !forecastRes.ok) {
    throw new Error('Failed to load weather data. Please try again.')
  }

  const [weatherData, forecastData] = await Promise.all([
    weatherRes.json(),
    forecastRes.json(),
  ])

  return {
    current: {
      city: name,
      country,
      temp: Math.round(weatherData.main.temp),
      feelsLike: Math.round(weatherData.main.feels_like),
      condition: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
      humidity: weatherData.main.humidity,
      windSpeed: Math.round(weatherData.wind.speed * 3.6), // m/s → km/h
    },
    forecast: groupForecastByDay(forecastData.list),
  }
}
