import { registerComponent } from "@qorebase/app-cli";
import React from 'react'

import {
  Box,
  Button,
  Alert,
  AlertIcon,
  ScaleFade
} from '@chakra-ui/react'

const url = 'https://staging-qore-data-teacher-593643.qore.dev'
const headers = {
  accept: '*/*',
  'x-qore-engine-admin-secret': 'UM5MlKofJjxhC0KQejD8WZi2cmbpAN5A',
}

const Checkout = registerComponent("Petloop Checkout Button", {
  type: "none",
  icon: "IconX",
  group: "button",
  defaultProps: {
    label: "",
    cartId: "",
    userId: "",
    action: { type: 'none' },
  },
  propDefinition: {
    label: {
      type: "string",
      options: {
        format: "text",
      },
    },
    cartId: {
      type: "string",
      options: {
        format: "text",
      },
    },
    userId: {
      type: "string",
      options: {
        format: "text",
      },
    },
    action: {
      group: 'Action',
      type: 'action',
      label: "Success Action",
      options: { type: 'none' }
    },
  },
  Component: (props) => {
    const client = props.hooks.useClient()
    const label = props.hooks.useTemplate(props.properties.label)
    const cartId = props.hooks.useTemplate(props.properties.cartId)
    const userId = props.hooks.useTemplate(props.properties.userId)

    const [error, setError] = React.useState(null)
    const [loading, setLoading] = React.useState(false)

    const action = props.hooks.useActionTrigger(
      props.properties.action,
      props.data.page.row,
      props.pageSource,
    )

    React.useEffect(() => {
      if (error !== null) {
        setTimeout(() => {
          setError(null)
        }, 3000)
      }
    }, [error, setError])

    const handleCheckout = async () => {
      setLoading(true)
      try {
        if (cartId == 'none') throw new Error("Keranjang masih kosong!")

        //get cart item by cart id
        const response = await client.project.axios({
          method: 'post',
          headers,
          url: `${url}/v1/execute`,
          data: {
            operations: [
              {
                operation: 'Select',
                instruction: {
                  table: 'cart_items',
                  name: "data",
                  condition: {
                    cart: cartId
                  },
                },
              }
            ]
          }
        })

        if (!response.data.results.data.length) throw new Error("Keranjang masih kosong!")

        //check stock & same store
        let storeId = ''
        let isDifferentStore = false
        let isOutStock = false

        let dataSelected = []
        let total_price_selected = 0

        let dataUnselected = []
        let total_price_unselected = 0

        response.data.results.data.forEach((item, index) => {
          if (item.is_selected) {
            dataSelected.push(item)
            total_price_selected += item.qty * item.price

            if (storeId == '') storeId = item.service_place_id
            if (storeId != item.service_place_id) isDifferentStore = true
            if (item.qty > item.quantity) isOutStock = true
          } else {
            dataUnselected.push(item)
            total_price_unselected += item.qty * item.price
          }
        });

        if (isDifferentStore) throw new Error("Pastikan hanya checkout dengan 1 toko yang sama!")
        if (isOutStock) throw new Error("Stok habis!")

        if (!dataSelected.length) throw new Error("Pastikan anda memilih produk yang akan dibeli!")

        let date = new Date();
        let year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
        let month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(date);
        let day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);

        //insert new transaction & new cart with status checkout, and move cart item
        await client.project.axios({
          method: 'post',
          headers,
          url: `${url}/v1/execute`,
          data: {
            operations: [
              {
                operation: 'Insert',
                instruction: {
                  table: 'Transactions',
                  name: "insertTransactions",
                  data: {
                    date: date.toISOString(),
                    user_transactions: userId,
                    status: 'Waiting Payment',
                    amount: total_price_selected,
                    service_place_transaction: storeId,
                    date_string: `${day}/${month}/${year}`,
                    service_place_string: storeId
                  },
                },
              },
              {
                operation: 'Insert',
                instruction: {
                  table: 'carts',
                  name: "insertCart",
                  data: {
                    user_cart: userId,
                    transaction_cart: "{{insertTransactions[0].id}}",
                    status: 'Checkout',
                    total_price: total_price_selected,
                    grand_total: total_price_selected,
                    service_place_cart: storeId,
                  },
                },
              },
              ...dataSelected.map(item => {
                return {
                  operation: 'Update',
                  instruction: {
                    table: 'cart_items',
                    name: "updateCartItem",
                    condition: {
                      id: item.id
                    },
                    set: {
                      cart: "{{insertCart[0].id}}"
                    },
                  }
                }
              }),
              {
                operation: 'Update',
                instruction: {
                  table: 'carts',
                  name: "UpdateCart",
                  condition: {
                    id: cartId,
                  },
                  set: {
                    total_price: total_price_unselected,
                    grand_total: total_price_unselected,
                  }
                },
              },
            ]
          }
        })

        action.handleClick()
      } catch (error) {
        setError(error.message)
        // throw new Error(error)
      }
      setLoading(false)
    }

    return (
      <Box padding="8px" pt="0" mt="0" h="min-content">
        <Box
          p={2}
          pt={4}
          pb={4}
        >

          {error !== null &&
            <ScaleFade initialScale={0.4} in={error !== null}>
              <Alert status='error' mb={4} fontSize={12}>
                <AlertIcon />
                {error}
              </Alert>
            </ScaleFade>
          }

          <Button
            width="full"
            colorScheme="blue"
            onClick={handleCheckout}
            isLoading={loading}
            loadingText="Loading..."
          >{label}</Button>
        </Box>
      </Box>
    )
  }
})

export default Checkout