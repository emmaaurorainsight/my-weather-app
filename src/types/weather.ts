export interface CurrentWeather {
  city: string
  country: string
  temp: number
  feelsLike: number
  condition: string
  icon: string
  humidity: number
  windSpeed: number
}

export interface ForecastDay {
  date: string       // ISO date string, e.g. "2024-01-15"
  tempMin: number
  tempMax: number
  condition: string
  icon: string
}

export interface WeatherData {
  current: CurrentWeather
  forecast: ForecastDay[]
}
