import fs from 'fs'
import path from 'path'

export class NoSQLDatabase {
  constructor(databaseName) {
    const __dirname = new URL('.', import.meta.url).pathname
    this.databasePath = path.join(__dirname, `${databaseName}.json`)
    console.log(this.databasePath)
    this.tables = {}

    if (fs.existsSync(this.databasePath)) {
      const data = fs.readFileSync(this.databasePath, 'utf-8')
      const jsonData = JSON.parse(data)
      this.tables = jsonData.tables
    } else {
      this.save()
    }
  }

  save() {
    const data = JSON.stringify({ tables: this.tables }, null, 2)
    fs.writeFileSync(this.databasePath, data)
  }

  createTable(tableName, schema) {
    if (this.tables[tableName]) {
      throw new Error(`Table ${tableName} already exists`)
    }
    this.tables[tableName] = {
      schema,
      data: [],
      nextId: 1,
    }
    this.save()
    console.log(this.tables)
  }

  insert(tableName, row) {
    const table = this.tables[tableName]
    row.id = table.nextId
    table.data.push(row)
    table.nextId += 1
    this.save()
  }

  update(tableName, id, updates) {
    const table = this.tables[tableName]
    const row = table.data.find(r => r.id === id)
    if (!row) {
      throw new Error(`Row with id ${id} not found`)
    }
    Object.assign(row, updates)
    this.save()
  }

  delete(tableName, id) {
    const table = this.tables[tableName]
    const index = table.data.findIndex(r => r.id === id)
    if (index === -1) {
      throw new Error(`Row with id ${id} not found`)
    }
    table.data.splice(index, 1)
    this.save()
  }

  dropTable(tableName) {
    if (!this.tables[tableName]) {
      throw new Error(`Table ${tableName} not found`)
    }
    delete this.tables[tableName]
    this.save()
  }

  getTableData(tableName, options = {}) {
    const table = this.tables[tableName]
    let data = [...table.data]
    if (options.filter) {
      data = data.filter(options.filter)
    }
    if (options.sortBy) {
      data = data.sort((a, b) => {
        const valA = a[options.sortBy]
        const valB = b[options.sortBy]
        if (typeof valA === 'string') {
          return valA.localeCompare(valB)
        }
        return valA - valB
      })
    }
    return { data, schema: table.schema }
  }
}

export class TableSchema {
  constructor(fields) {
    this.fields = fields
  }
}

// const db3 = new NoSQLDatabase('3-db')

const thirdTest = new TableSchema({
  id: { type: 'number', primaryKey: true },
  name: { type: 'string' },
  phone: { type: 'string' },
  birthday: { type: 'string' },
  age: { type: 'number' },
})
// db3.createTable('winners', thirdTest)
// db3.insert('winners', {
//   name: '59ce',
//   age: 15,
//   phone: '+888888888',
//   birthday: '80-2530',
// })
// db3.getTableData('winners')
// console.log(db3)
