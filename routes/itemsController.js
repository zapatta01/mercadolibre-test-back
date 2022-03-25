const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const config = require('../config/settings');
const okStatus = 200;
const defaultLimit = '4';

const author = {
  name: 'Juan Camilo',
  lastname: 'Zapata',
};

router.get('/', function (request, response) {
  getItemsBySearch(request, response);
});

router.get('/:id', function (request, response) {
  getItemsById(request, response);
});

function badRequest(response) {
  response.status(400).send('Bad request').end;
}

async function getItemsBySearch(request, response) {
  if (JSON.stringify(request.query) !== '{}' && request.query.q) {
    const limit = request.query.limit ?? defaultLimit;
    const queryRequest = request.query.q.toLowerCase();

    const itemsResponseRaw = await fetch(
      `${config.apiMELI}/sites/MLA/search?q=${queryRequest}&limit=${limit}`
    );

    if (itemsResponseRaw.status === okStatus) {
      let categoriesList = [];
      const itemsResponseJSON = await itemsResponseRaw.json();
      const itemsResult = itemsResponseJSON.results.map(item => {
        const items = {
          id: item.id,
          title: item.title,
          price: {
            currency: item.prices.prices[0].currency_id,
            amount: item.price,
            decimals: 0,
          },
          picture: item.thumbnail,
          condition: item.condition,
          free_shipping: item.shipping.free_shipping,
          stateName: item.address.state_name,
        };
        return items;
      });

      const categoriesResults = itemsResponseJSON.available_filters.filter(
        cat => cat.id === 'category'
      );

      if (categoriesResults.length !== 0) {
        const maxCategory = categoriesResults[0].values.reduce(
          (previousValue, currentValue) =>
            previousValue.results > currentValue.results
              ? previousValue
              : currentValue
        );

        const itemCategoriesResponseRaw = await fetch(
          `${config.apiMELI}/categories/${maxCategory.id}`
        );

        if (itemCategoriesResponseRaw.status === okStatus) {
          const itemCategoriesJSON = await itemCategoriesResponseRaw.json();
          categoriesList = itemCategoriesJSON.path_from_root.map(
            cat => cat.name
          );
        }
      }

      const items = {
        author: author,
        categories: categoriesList,
        items: itemsResult,
      };

      response.status(okStatus).json(items);
    } else {
      response
        .status(itemsResponseRaw.status)
        .send('Status ' + itemsResponseRaw.status).end;
    }
  } else badRequest(response);
}

async function getItemsById(request, response) {
  const id = request.params.id;
  const itemResponseRaw = await fetch(`${config.apiMELI}/items/${id}`);

  if (itemResponseRaw.status === okStatus) {
    const itemDescriptionResponseRaw = await fetch(
      `${config.apiMELI}/items/${id}/description`
    );
    if (itemDescriptionResponseRaw.status === okStatus) {
      const itemResponseJSON = await itemResponseRaw.json();
      const itemDescriptionResponseJSON =
        await itemDescriptionResponseRaw.json();
      let categoriesList = [];

      const itemCategoriesResponseRaw = await fetch(
        `${config.apiMELI}/categories/${itemResponseJSON.category_id}`
      );

      if (itemCategoriesResponseRaw.status === okStatus) {
        const itemCategoriesJSON = await itemCategoriesResponseRaw.json();
        categoriesList = itemCategoriesJSON.path_from_root.map(cat => cat.name);
      }

      const item = {
        author: author,
        categories: categoriesList,
        item: {
          id: itemResponseJSON.id,
          title: itemResponseJSON.title,
          price: {
            currency: itemResponseJSON.currency_id,
            amount: itemResponseJSON.price,
            decimals: 0,
          },
          picture: itemResponseJSON.pictures[0].url,
          condition: itemResponseJSON.condition,
          free_shipping: itemResponseJSON.shipping.free_shipping,
          sold_quantity: itemResponseJSON.sold_quantity,
          description: itemDescriptionResponseJSON.plain_text,
        },
      };
      response.status(okStatus).json(item);
    } else {
      response
        .status(itemResponseRaw.status)
        .send('Status ' + itemResponseRaw.status).end;
    }
  }
}

module.exports = router;
