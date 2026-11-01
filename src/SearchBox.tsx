import { useEffect, useState } from 'react'
import { searchPlaces, type Place } from './api'

interface Props {
  onSelect: (place: Place) => void
}

export default function SearchBox({ onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    const controller = new AbortController()
    const timer = setTimeout(() => {
      searchPlaces(query.trim(), controller.signal)
        .then((r) => {
          setResults(r)
          setOpen(true)
        })
        .catch(() => {})
    }, 300)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  function pick(place: Place) {
    onSelect(place)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  return (
    <div className="search">
      <input
        type="search"
        placeholder="Şehir ara… (ör. Kocaeli)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results[0]) pick(results[0])
          if (e.key === 'Escape') setOpen(false)
        }}
      />
      {open && results.length > 0 && (
        <ul className="results">
          {results.map((p) => (
            <li key={p.id}>
              <button onClick={() => pick(p)}>
                <strong>{p.name}</strong>
                <span>{[p.admin1, p.country].filter(Boolean).join(', ')}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
