import cors from 'cors'
import express from 'express'
import { NoSQLDatabase, TableSchema } from './DB/index.js'

const app = express()
app.use(cors())

const db = new NoSQLDatabase('my-database')

const thirdTest = new TableSchema({
  id: { type: 'number', primaryKey: true },
  name: { type: 'string' },
  phone: { type: 'string' },
  birthday: { type: 'string' },
  age: { type: 'number' },
})
// db.createTable('winners', thirdTest)
// db.insert('winners', {
//   name: '59ce',
//   age: 15,
//   phone: '+888888888',
//   birthday: '80-2530',
// })
// db.dropTable('winners')
// Define the API endpoints
app.get('/tables', (req, res) => {
  const tables = Object.keys(db.tables)
  res.json(tables)
})

app.post('/tables', (req, res) => {
  try {
    const { name, schema } = req.body
    console.log(schema);
    const tableSchema = new TableSchema(schema)
    db.createTable(name, tableSchema)
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Internal Server Error' })
  }
})


app.get('/tables/:name', (req, res) => {
  const { name } = req.params
  const table = db.getTableData(name)
  res.json(table)
})

app.post('/tables/:name', (req, res) => {
  const { name } = req.params
  const row = req.body
  db.insert(name, row)
  res.json({ success: true })
})

app.put('/tables/:name/:id', (req, res) => {
  const { name, id } = req.params
  const updates = req.body
  db.update(name, parseInt(id), updates)
  res.json({ success: true })
})

app.delete('/tables/:name/:id', (req, res) => {
  const { name, id } = req.params
  db.delete(name, parseInt(id))
  res.json({ success: true })
})

app.delete('/tables/:name', (req, res) => {
  const { name } = req.params
  db.dropTable(name)
  res.json({ success: true })
})

const port = 4000
const startServer = () => {
  try {
    app.listen(port, () =>
      console.log(`Server has started on port http://localhost:${port}`)
    )
  } catch (error) {
    console.log(error)
  }
}

startServer()
