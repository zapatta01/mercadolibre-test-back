const express = require('express')
const cors = require('cors')
const ItemsController = require('./routes/itemsController')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api', (request, response) => {
  console.info(request.ip)
  console.info(request.ips)
  console.info(request.originalUrl)
  response.send('<h1>Server is up!!!</h1>')
})

app.use('/api/items', ItemsController)

module.exports = app
