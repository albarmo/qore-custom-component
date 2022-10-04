import axiod from 'https://deno.land/x/axiod/mod.ts'

const AUTH_STRING = `eG5kX2RldmVsb3BtZW50X0JCYjJWOXY1V01TTU9sNzZOd3dVNFlXeWdUSmpMQnphWDFBaDFTaXJEVnZHSUxGSFgxWGdWUjVuNzIxT3U6==`
const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Basic ${AUTH_STRING}`,
}

const qoreHeaders = {
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'x-qore-engine-admin-secret': 'qTWuRX0a1erpTSTunr8RxluoeXIs3ejD',
  Connection: 'keep-alive',
  Cookie: 'ADMIN-SECRET=qTWuRX0a1erpTSTunr8RxluoeXIs3ejD',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  TE: 'trailers',
}

const getCartItems = async (cartId) => {
  try {
    const { data } = await axiod({
      method: 'post',
      url: 'https://staging-qore-data-jewellery-713559.qore.dev/v1/execute',
      headers: qoreHeaders,
      data: {
        operations: [
          {
            operation: 'Select',
            instruction: {
              view: 'items_by_cart_id',
              name: 'items',
              limit: 50,
              offset: 0,
              orderBy: {
                id: 'ASC',
              },
              params: {
                cart_id: cartId,
              },
            },
          },
        ],
      },
    })
    return data.results.items
  } catch (error) {
    return error
  }
}

const updateCart = async (row, xendit, user) => {
  try {
    const { data } = await axiod({
      method: 'post',
      url: 'https://staging-qore-data-jewellery-713559.qore.dev/v1/execute',
      headers: qoreHeaders,
      data: {
        operations: [
          {
            operation: 'Insert',
            instruction: {
              table: 'transactions',
              name: 'insertTransaction',
              data: {
                payment_status: 'WAITING',
                cart_transaction: row.id,
                payer_email: user.external_id
              },
            },
          },
          {
            operation: 'Update',
            instruction: {
              table: 'carts',
              name: 'updateCart',
              condition: {
                id: row.id,
              },
              set: {
                status: 'waiting payment',
                invoice_url: xendit.invoice_url,
                expired_date: xendit.expiry_date,
                transaction_id: '{{insertTransaction[0].id}}',
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
  if (row.status !== "draft") throw new Error('cart is already checkout')
  const user_id = row.user_carts
  const items = await getCartItems(row.id)

  if (!items) throw new Error('cart is empty')

  const itemsInCart = items.map((val) => {
    return { id: val.id, name: val.variant_name, price: +val.variant_price, quantity: val.quantity }
  })

  const parameter = {
    external_id: row.id.toString(),
    payer_email: user_id.external_id,
    amount: +row.grand_total,
    description: `Amoda Checkout Invoice`,
    invoice_duration: 2000,
    customer: {
      given_names: user_id.name,
      surname: user_id.name,
      email: user_id.external_id,
    },
    items: itemsInCart,
    success_redirect_url: "https://amoda-apps.qore.dev/page/Bck",
    failure_redirect_url: "https://amoda-apps.qore.dev/page",
    currency: "IDR",
  }

  const xenditInvoice = await axiod.post(
    "https://api.xendit.co/v2/invoices",
    parameter,
    { headers: headers },
    {
      auth: {
        username:
          "xnd_development_BBb2V9v5WMSMOl76NwwU4YWygTJjLBzaX1Ah1SirDVvGILFHX1XgVR5n721Ou",
        password: null,
      },
    }
  );

  if (!xenditInvoice) throw new Error('failed generate invoice')
  const results = await updateCart(row, xenditInvoice.data, user_id)
  return { xenditInvoice, results }
}