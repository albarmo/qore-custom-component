import axiod from 'https://deno.land/x/axiod/mod.ts'
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:102.0) Gecko/20100101 Firefox/102.0',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'x-qore-engine-admin-secret': 'qTWuRX0a1erpTSTunr8RxluoeXIs3ejD',
  Connection: 'keep-alive',
  Referer:
    'https://staging-qore-data-jewellery-713559.qore.dev/tables/insights',
  Cookie: 'ADMIN-SECRET=qTWuRX0a1erpTSTunr8RxluoeXIs3ejD',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  TE: 'trailers',
}

const getUserCarts = async (user_id) => {
  try {
    const { data } = await axiod({
      method: 'post',
      url: 'https://staging-qore-data-jewellery-713559.qore.dev/v1/execute',
      headers: headers,
      data: {
        operations: [
          {
            operation: 'Select',
            instruction: {
              view: 'carts_by_user_id',
              name: 'cart',
              limit: 1,
              offset: 0,
              orderBy: {
                id: 'ASC',
              },
              params: {
                user_id: user_id,
              },
            },
          },
        ],
      },
    })
    return data.results.cart
  } catch (error) {
    return error
  }
}

const getCartItems = async (cart_id) => {
  try {
    const { data } = await axiod({
      method: 'post',
      url: 'https://staging-qore-data-jewellery-713559.qore.dev/v1/execute',
      headers: headers,
      data: {
        operations: [
          {
            operation: 'Select',
            instruction: {
              view: 'items_by_cart_id',
              name: 'cart_items',
              limit: 50,
              offset: 0,
              orderBy: {
                id: 'ASC',
              },
              params: {
                cart_id: cart_id,
              },
            },
          },
        ],
      },
    })
    return data.results.cart_items
  } catch (error) {
    return error
  }
}

const createCart = async (user_id, variant_id, price) => {
  try {
    const { data } = await axiod({
      method: 'post',
      url: 'https://staging-qore-data-jewellery-713559.qore.dev/v1/execute',
      headers: headers,
      data: {
        operations: [
          {
            operation: 'Insert',
            instruction: {
              table: 'carts',
              name: 'insertCart',
              data: {
                user_carts: user_id,
                status: 'draft',
              },
            },
          },
          {
            operation: 'Insert',
            instruction: {
              table: 'cart_items',
              name: 'insertCartItem',
              data: {
                cart: '{{insertCart[0].id}}',
                variant: variant_id,
                quantity: 1,
                subtotal: price,
              },
            },
          },
        ],
      },
    })

    return data
  } catch (error) {
    return error
  }
}

const insertItemToCart = async (cart_id, variant_id, price) => {
  try {
    const { data } = await axiod({
      method: 'post',
      url: 'https://staging-qore-data-jewellery-713559.qore.dev/v1/execute',
      headers: headers,
      data: {
        operations: [
          {
            operation: 'Insert',
            instruction: {
              table: 'cart_items',
              name: 'insertCartItem',
              data: {
                cart: cart_id,
                variant: variant_id,
                quantity: 1,
                subtotal: price,
              },
            },
          },
        ],
      },
    })

    return data
  } catch (error) {
    return error
  }
}

const updateItemInCart = async (row, item) => {
  const newQty = item.quantity + 1
  try {
    const { data } = await axiod({
      method: 'post',
      url: 'https://staging-qore-data-jewellery-713559.qore.dev/v1/execute',
      headers: headers,
      data: {
        operations: [
          {
            operation: 'Update',
            instruction: {
              table: 'cart_items',
              name: 'updateCartItem',
              condition: {
                cart: item.cart,
                variant: row.id,
              },
              set: {
                quantity: newQty,
                subtotal: row.price * newQty,
              },
            },
          },
        ],
      },
    })
    return data
  } catch (error) {
    return error
  }
}

const main = async (user, row, args, global) => {
  // if (!args.user_id) throw new Error("user id cannot be empty")
  const user_id = args.user_id || 3
  const cart = await getUserCarts(user_id)

  if (!cart.length) {
    const newCart = await createCart(user_id, row.id, row.price)
    return { newCart }
  } else {
    const items = await getCartItems(cart[0].id)
    const indexFound = items.find((i) => i.variant == row.id)

    if (indexFound) {
      const update = await updateItemInCart(row, indexFound)
      return update
    } else {
      const create = await insertItemToCart(cart[0].id, row.id, row.price)
      return create
    }
  }
}
