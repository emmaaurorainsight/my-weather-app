import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function App() {
  const [query, setQuery] = useState('')
  const [searchedCity, setSearchedCity] = useState<string | null>(null)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    setSearchedCity(trimmed)
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
          <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
              My Weather App
            </h1>
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8"
        >
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
                className="w-full sm:w-auto"
              >
                <Search className="mr-2 h-4 w-4" aria-hidden="true" />
                Search
              </Button>
            </form>
          </section>

          {searchedCity && (
            <section
              aria-label="Search result"
              aria-live="polite"
              className="mt-8"
            >
              <Card className="border-primary/20 shadow-md">
                <CardHeader>
                  <CardTitle className="text-primary text-xl">
                    {searchedCity}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Weather data for{' '}
                    <span className="font-medium text-foreground">{searchedCity}</span>{' '}
                    will appear here once the API integration is complete.
                  </p>
                </CardContent>
              </Card>
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
