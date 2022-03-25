const express = require('express')
const cors = require('cors')
const ItemsController = require('./routes/itemsController')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api', (request, response) => {
  console.log(request.ip)
  console.log(request.ips)
  console.log(request.originalUrl)
  response.send('<h1>Server is up!!!</h1>')
})

app.use('/api/items', ItemsController)

app.use(function (err, req, res, next) {
  res.status(err.message).end()
})

module.exports = app
