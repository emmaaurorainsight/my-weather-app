import React, { useState, useEffect } from 'react'
import { Search, Wind, Droplets, AlertCircle, Loader2, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { fetchWeather } from '@/api/weather'
import type { WeatherData } from '@/types/weather'

function weatherIconUrl(icon: string) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`
}

function formatDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function getInitialDark(): boolean {
  const stored = localStorage.getItem('theme')
  if (stored === 'dark') return true
  if (stored === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export default function App() {
  const [query, setQuery] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dark, setDark] = useState(getInitialDark)

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)
    setWeather(null)

    try {
      const data = await fetchWeather(trimmed)
      setWeather(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-md"
      >
        Skip to main content
      </a>

      <div className="min-h-screen bg-background flex flex-col">
        <header className="w-full border-b border-border bg-card shadow-sm" role="banner">
          <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
              My Weather App
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDark((d) => !d)}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark
                ? <Sun className="h-5 w-5" aria-hidden="true" />
                : <Moon className="h-5 w-5" aria-hidden="true" />}
            </Button>
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8"
        >
          {/* Search */}
          <section aria-label="City search">
            <form
              onSubmit={handleSearch}
              role="search"
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <label htmlFor="city-input" className="sr-only">
                Search for a city
              </label>
              <Input
                id="city-input"
                type="search"
                placeholder="Enter a city name…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="City name"
                autoComplete="off"
                className="flex-1"
              />
              <Button
                type="submit"
                aria-label="Search for weather"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  : <Search className="mr-2 h-4 w-4" aria-hidden="true" />}
                {loading ? 'Searching…' : 'Search'}
              </Button>
            </form>
          </section>

          {/* Error */}
          {error && (
            <section aria-live="assertive" aria-label="Error message" className="mt-6">
              <Card className="border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 text-red-700 dark:text-red-400">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-sm">{error}</p>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Weather results */}
          {weather && (
            <section aria-live="polite" aria-label="Weather results" className="mt-8 space-y-6">

              {/* Current weather */}
              <Card className="border-primary/20 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-primary text-2xl">
                    {weather.current.city}, {weather.current.country}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Temp + icon */}
                    <div className="flex items-center gap-2">
                      <img
                        src={weatherIconUrl(weather.current.icon)}
                        alt={weather.current.condition}
                        width={64}
                        height={64}
                        className="-ml-2"
                      />
                      <div>
                        <p className="text-5xl font-bold text-foreground">
                          {weather.current.temp}°C
                        </p>
                        <p className="text-muted-foreground text-sm mt-1">
                          {capitalize(weather.current.condition)}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Feels like {weather.current.feelsLike}°C
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex gap-6 sm:flex-col sm:gap-3">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Droplets className="h-4 w-4 text-primary" aria-hidden="true" />
                        <span>
                          <span className="sr-only">Humidity: </span>
                          {weather.current.humidity}% humidity
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Wind className="h-4 w-4 text-primary" aria-hidden="true" />
                        <span>
                          <span className="sr-only">Wind speed: </span>
                          {weather.current.windSpeed} km/h wind
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 5-day forecast */}
              {weather.forecast.length > 0 && (
                <section aria-label="5-day forecast">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    5-Day Forecast
                  </h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    {weather.forecast.map((day) => (
                      <Card key={day.date} className="border-primary/10 text-center">
                        <CardContent className="pt-4 pb-4 px-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            {formatDate(day.date)}
                          </p>
                          <img
                            src={weatherIconUrl(day.icon)}
                            alt={day.condition}
                            width={48}
                            height={48}
                            className="mx-auto"
                          />
                          <p className="text-xs text-muted-foreground mb-1">
                            {capitalize(day.condition)}
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {day.tempMax}°{' '}
                            <span className="font-normal text-muted-foreground">
                              / {day.tempMin}°
                            </span>
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}
            </section>
          )}
        </main>

        <footer
          className="w-full border-t border-border py-4 text-center text-xs text-muted-foreground"
          role="contentinfo"
        >
          My Weather App &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </>
  )
}
