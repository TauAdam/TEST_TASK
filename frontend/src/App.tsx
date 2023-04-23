import { useEffect, useRef, useState } from 'react'

type Field = {
  type: string
  primaryKey?: boolean
}

type Table = {
  name: string
  schema: { [key: string]: Field }
  data: { [key: string]: any }[]
}

type ColumnType = 'string' | 'number' | 'file'

interface ColumnSchema {
  type: ColumnType
  primaryKey?: boolean
}

interface TableSchema {
  [columnName: string]: ColumnSchema
}
const App = () => {
  const [tables, setTables] = useState<string[]>([])
  const [currentTable, setCurrentTable] = useState<Table | null>(null)
  const [columns, setColumns] = useState(1)
  const [tableName, setTableName] = useState('')
  const [fields, setFields] = useState({})
  const typeRef = useRef(null)

  useEffect(() => {
    fetch('http://localhost:4000/tables')
      .then(res => res.json())
      .then(data => setTables(data))
      .catch(err => console.log(err))
  }, [])

  const handleTableSelect = (tableName: string) => {
    fetch(`http://localhost:4000/tables/${tableName}`)
      .then(res => res.json())
      .then(data => setCurrentTable({ name: tableName, ...data }))
      .catch(err => console.log(err))
  }

  const handleTableCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const tableSchema: TableSchema = {}

    for (let i = 0; i < columns; i++) {
      const nameInput = document.querySelector(
        `#column_${i}_name`
      ) as HTMLInputElement | null
      const typeInput = document.querySelector(
        `#column_${i}_type`
      ) as HTMLSelectElement | null
      const indexInput = document.querySelector(
        `#column_${i}_index`
      ) as HTMLSelectElement | null

      if (nameInput && typeInput && indexInput) {
        const name = nameInput.value
        const type = typeInput.value as ColumnType
        const index = indexInput.value

        const column: ColumnSchema = { type }
        if (index === 'PrimaryKey') {
          column.primaryKey = true
        }

        tableSchema[name] = column
      }
    }
    console.log(tableSchema)
    console.log(tableName)

    fetch('http://localhost:4000/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: tableName, schema: tableSchema }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTables([...tables, tableName])
          setTableName('')
        }
      })
      .catch(err => console.log(err))
  }

  const handleRowCreate = (formData: { [key: string]: any }) => {
    fetch(`http://localhost:4000/tables/${currentTable?.name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCurrentTable({
            ...currentTable!,
            data: [...currentTable!.data, formData],
          })
          // reset()
        }
      })
      .catch(err => console.log(err))
  }

  const handleRowUpdate = (id: number, updates: { [key: string]: any }) => {
    fetch(`http://localhost:4000/tables/${currentTable?.name}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCurrentTable({
            ...currentTable!,
            data: currentTable!.data.map(row =>
              row.id === id ? { ...row, ...updates } : row
            ),
          })
        }
      })
      .catch(err => console.log(err))
  }

  const handleRowDelete = (id: number) => {
    fetch(`http://localhost:4000/tables/${currentTable?.name}/${id}`, {
      method: 'DELETE',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCurrentTable({
            ...currentTable!,
            data: currentTable!.data.filter(row => row.id !== id),
          })
        }
      })
      .catch(err => console.log(err))
  }
  const handleTableDelete = () => {
    fetch(`http://localhost:4000/tables/${currentTable?.name}`, {
      method: 'DELETE',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTables(
            tables.filter(tableName => tableName !== currentTable?.name)
          )
          setCurrentTable(null)
        }
      })
      .catch(err => console.log(err))
  }

  return (
    <div>
      <h1>NoSQL Database Manager</h1>
      <div>
        <h2>Tables</h2>
        <ul>
          {tables.map(tableName => (
            <li key={tableName}>
              <button onClick={() => handleTableSelect(tableName)}>
                {tableName}
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={handleTableCreate}>
          <h3>Create Table</h3>
          <label htmlFor='tableName'>Table name</label>
          <input
            type='text'
            value={tableName}
            onChange={e => setTableName(e.target.value)}
            id='tableName'
          />
          <label htmlFor='tableSchema'>Columns</label>
          <input
            required
            type='number'
            value={columns}
            onChange={e => {
              setColumns(+e.target.value)
            }}
            id='columns'
          />
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Index</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(columns)].map((el, i) => (
                <tr key={i}>
                  <td>
                    <input
                      type='text'
                      placeholder='Max'
                      id={`column_${i}_name`}
                      onChange={e => setFields({ ...fields })}
                    />
                  </td>
                  <td>
                    <select required id={`column_${i}_type`}>
                      <option value='string'>string</option>
                      <option value='number'>number</option>
                      <option value='file'>file</option>
                    </select>
                  </td>
                  <td>
                    <select id={`column_${i}_index`}>
                      <option value='no'>---</option>
                      <option value='PrimaryKey'>Primary Key</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button type='submit'>Create</button>
        </form>
      </div>
      <div>
        {currentTable ? (
          <>
            <h2>{currentTable.name}</h2>
            <button onClick={handleTableDelete}>Drop Table</button>
            <table>
              <thead>
                <tr>
                  {Object.keys(currentTable.schema.fields).map(fieldName => (
                    <th key={fieldName}>{fieldName}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentTable.data.map((row, index) => (
                  <tr key={index}>
                    {Object.keys(currentTable.schema.fields).map(fieldName => (
                      <td key={fieldName}>{row[fieldName]}</td>
                    ))}
                    <td>
                      <button onClick={() => handleRowDelete(row.id)}>
                        Delete
                      </button>
                      <button onClick={() => handleRowUpdate(row.id, row)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {/* <tr>
                  <form onSubmit={handleSubmit(handleRowCreate)}>
                    {Object.keys(currentTable.schema).map(fieldName => (
                      <td key={fieldName}>
                        {currentTable.schema[fieldName].primaryKey ? (
                          '(auto-generated)'
                        ) : (
                          <input {...register(fieldName)} />
                        )}
                      </td>
                    ))}
                    <td>
                      <button type='submit'>Create</button>
                    </td>
                  </form>
                </tr> */}
              </tbody>
            </table>
          </>
        ) : (
          <p>Select a table from the list above or create a new one.</p>
        )}
      </div>
    </div>
  )
}
export default App
