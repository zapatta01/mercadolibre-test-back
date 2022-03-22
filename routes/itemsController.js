const express = require('express')
const router = express.Router()
let items = require('./itemsData')

router.get('/', function (request, response) {
  if (JSON.stringify(request.query) !== '{}') {
    const limit = request.query.limit
    const item = items.filter((item) =>
      item.item.title.toLowerCase().includes(request.query.q.toLowerCase())
    )
    const result = item.slice(0, limit)
    result ? response.json(result) : response.json('vacio')
  } else {
    response.json(items)
  }
})

router.get('/:id', function (request, response) {
  getItemsById(request, response)
})

router.get('/:id/description', function (request, response) {
  getItemsById(request, response)
})

router.post('/', (request, response) => {
  const reqItem = request.body
  const ids = items.map((item) => item.item.id)
  const maxId = Math.max(...ids) + 1

  console.log(reqItem)
  const newItem = {
    author: {
      name: 'Juan Camilo',
      lastname: 'Zapata'
    },
    item: {
      id: maxId,
      title: reqItem.item.title,
      price: {
        currency: 'Pesos',
        amount: 1,
        decimals: 2
      },
      picture: '/asd/asdasd/',
      condition: 'Nuevo',
      free_shipping:
        typeof reqItem.item.free_shipping !== 'undefined'
          ? reqItem.item.free_shipping
          : false,
      sold_quantity: 2,
      description: 'Ipad adsad'
    }
  }

  items = [...items, newItem]

  response.json(newItem)
})

router.put('/', (request, response) => {
  response.send('NOT IMPLEMENTED')
})

router.delete('/:id', (request, response) => {
  const id = Number(request.params.id)
  items = items.filter((item) => item.item.id !== id)
  response.status(200).end()
})

function getItemsById (request, response) {
  const id = Number(request.params.id)
  const item = items.find((item) => item.item.id === id)

  if (item) {
    response.json(item)
  } else {
    response.status(404).end()
  }
}

module.exports = router
