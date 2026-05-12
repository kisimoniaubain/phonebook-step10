import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const normalizeBaseUrl = (value) => value.replace(/\/$/, '')

const resolveApiBaseUrl = () => {
  const isBrowser = typeof window !== 'undefined'
  const isLocalhostBrowser =
    isBrowser &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

  const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  if (envBaseUrl) {
    const envHost = (() => {
      try {
        return new URL(envBaseUrl).hostname
      } catch {
        return ''
      }
    })()

    const envIsLocalhost = envHost === 'localhost' || envHost === '127.0.0.1'

    // Ignore localhost env values when app is deployed.
    if (!(envIsLocalhost && !isLocalhostBrowser)) {
      return normalizeBaseUrl(envBaseUrl)
    }
  }

  if (isBrowser && !isLocalhostBrowser) {
    return normalizeBaseUrl(window.location.origin)
  }

  return 'http://localhost:3001'
}

const apiBaseUrl = resolveApiBaseUrl()

function App() {
  const [persons, setPersons] = useState([])
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')

  const filteredPersons = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return persons
    return persons.filter((p) => p.name.toLowerCase().includes(q))
  }, [persons, query])

  const loadPersons = async () => {
    const response = await axios.get(`${apiBaseUrl}/api/persons`)
    setPersons(response.data)
  }

  useEffect(() => {
    loadPersons().catch(() => {
      setMessage('Failed to load persons from backend')
    })
  }, [])

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!name.trim() || !number.trim()) {
      setMessage('Name and number are required')
      return
    }

    try {
      const response = await axios.post(`${apiBaseUrl}/api/persons`, {
        name: name.trim(),
        number: number.trim()
      })
      setPersons(persons.concat(response.data))
      setName('')
      setNumber('')
      setMessage('Person added')
    } catch (error) {
      const serverMessage = error?.response?.data?.error
      setMessage(serverMessage || 'Failed to create person')
    }
  }

  const onDelete = async (id) => {
    try {
      await axios.delete(`${apiBaseUrl}/api/persons/${id}`)
      setPersons(persons.filter((p) => p.id !== id))
      setMessage('Person removed')
    } catch {
      setMessage('Failed to delete person')
    }
  }

  return (
    <main className="app">
      <h1>Phonebook</h1>
      <p className="hint">Backend: {apiBaseUrl}</p>
      {message ? <p className="message">{message}</p> : null}

      <section className="card">
        <h2>Add Person</h2>
        <form onSubmit={onSubmit}>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Number
            <input value={number} onChange={(e) => setNumber(e.target.value)} />
          </label>
          <button type="submit">Add</button>
        </form>
      </section>

      <section className="card">
        <h2>Persons</h2>
        <label>
          Search
          <input value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <ul>
          {filteredPersons.map((person) => (
            <li key={person.id}>
              <span>
                {person.name} - {person.number}
              </span>
              <button type="button" onClick={() => onDelete(person.id)}>
                delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default App
