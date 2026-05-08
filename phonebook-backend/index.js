require('dotenv').config()

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const fs = require('fs')
const path = require('path')

const app = express()
const DB_PATH = path.join(__dirname, 'persons-db.json')

const readPersons = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))

const writePersons = (persons) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(persons, null, 2))
}

morgan.token('body', (req) => JSON.stringify(req.body))
app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :response-time ms :body'))

app.get('/', (_req, res) => {
  res.send('Phonebook backend is running')
})

app.get('/info', (_req, res) => {
  const persons = readPersons()
  res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`)
})

app.get('/api/persons', (_req, res) => {
  res.json(readPersons())
})

app.get('/api/persons/:id', (req, res) => {
  const persons = readPersons()
  const person = persons.find((p) => p.id === req.params.id)

  if (!person) {
    return res.status(404).json({ error: 'person not found' })
  }

  return res.json(person)
})

app.delete('/api/persons/:id', (req, res) => {
  const persons = readPersons()
  const next = persons.filter((p) => p.id !== req.params.id)

  if (next.length === persons.length) {
    return res.status(404).json({ error: 'person not found' })
  }

  writePersons(next)
  return res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  const { name, number } = req.body

  if (!name || !number) {
    return res.status(400).json({ error: 'name and number are required' })
  }

  const persons = readPersons()
  if (persons.some((p) => p.name === name)) {
    return res.status(400).json({ error: 'name must be unique' })
  }

  const person = {
    id: String(Math.floor(Math.random() * 1e9)),
    name,
    number
  }

  writePersons(persons.concat(person))
  return res.status(201).json(person)
})

const unknownEndpoint = (_req, res) => {
  res.status(404).json({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
