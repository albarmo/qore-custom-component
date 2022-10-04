import { registerComponent } from "@qorebase/app-cli";
import React from 'react'
import {
  Box,
  Button,
  Center,
  Stack,
  Image,
  SimpleGrid,
  Text,
  Grid,
  GridItem,
  Skeleton,
  ScaleFade,
  Badge
} from '@chakra-ui/react'

const url = 'https://staging-qore-data-teacher-593643.qore.dev'
const headers = {
  accept: '*/*',
  'x-qore-engine-admin-secret': 'UM5MlKofJjxhC0KQejD8WZi2cmbpAN5A',
}

const Item = (props) => {
  const { item } = props
  const client = props.hooks.useClient()
  const itemId = props.hooks.useTemplate(item.id || props.source.itemId)

  const userId = props.hooks.useTemplate(props.properties.userId);

  const imageSource = props.hooks.useTemplate(props.properties.imageSource);
  const title = props.hooks.useTemplate(props.properties.title);
  const price = props.hooks.useTemplate(props.properties.price);
  const storeName = props.hooks.useTemplate(props.properties.storeName);

  // const [qty, setQty] = React.useState(0)

  const [showSuccess, setShowSuccess] = React.useState(false)

  const [loading, setLoading] = React.useState(false)

  const action = props.hooks.useActionTrigger(
    props.properties.action,
    props.data.page.row,
    props.pageSource,
  )

  React.useEffect(() => {
    if (showSuccess) {
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    }
  }, [showSuccess, setShowSuccess])

  // const action2 = props.hooks.useActionTrigger(
  //   props.properties.action2,
  //   props.data.page.row,
  //   props.pageSource,
  // )

  // const increment = async () => {
  //   setLoading(true)
  //   try {
  //     const response = await client.project.axios({
  //       method: 'post',
  //       headers,
  //       url: `${url}/v1/execute`,
  //       data: {
  //         operations: [
  //           {
  //             operation: 'Select',
  //             instruction: {
  //               table: 'carts',
  //               name: "data",
  //               condition: {
  //                 status: {
  //                   $eq: "draft"
  //                 },
  //                 user_cart: {
  //                   $eq: userId
  //                 }
  //               },
  //             },
  //           },
  //         ],
  //       },
  //     })

  //     if (response.data?.results?.data?.length > 0) {
  //       const cart = response.data.results.data[0]
  //       await updateCart(cart)
  //     } else {
  //       await insertCart()
  //     }

  //     setQty(qty + 1)

  //   } catch (error) {
  //     throw new Error(error)
  //   }
  //   setLoading(false)
  // }

  // const insertCart = async () => {
  //   try {
  //     await client.project.axios({
  //       method: 'post',
  //       headers,
  //       url: `${url}/v1/execute`,
  //       data: {
  //         operations: [
  //           {
  //             operation: 'Insert',
  //             instruction: {
  //               table: 'carts',
  //               name: "insertCart",
  //               data: {
  //                 user_cart: userId,
  //                 status: 'draft',
  //                 total_price: item.price * (qty + 1),
  //                 grand_total: item.price * (qty + 1),
  //               },
  //             },
  //           },
  //           {
  //             operation: 'Insert',
  //             instruction: {
  //               table: 'cart_items',
  //               name: "insertCartItem",
  //               data: {
  //                 cart: "{{insertCart[0].id}}",
  //                 product_cart: itemId,
  //                 qty: qty + 1,
  //                 subtotal: item.price * (qty + 1),
  //               },
  //             },
  //           },
  //         ],
  //       },
  //     })
  //   } catch (error) {
  //     throw new Error(error)
  //   }
  // }

  // const updateCart = async (cart) => {
  //   try {
  //     const response = await client.project.axios({
  //       method: 'post',
  //       headers,
  //       url: `${url}/v1/execute`,
  //       data: {
  //         operations: [
  //           {
  //             operation: 'Select',
  //             instruction: {
  //               table: 'cart_items',
  //               name: "data",
  //               condition: {
  //                 cart: cart.id
  //               },
  //             },
  //           },
  //         ],
  //       },
  //     })

  //     const indexFound = response.data.results.data.findIndex(i => i.product_cart == itemId);

  //     if (indexFound < 0) {
  //       await client.project.axios({
  //         method: 'post',
  //         headers,
  //         url: `${url}/v1/execute`,
  //         data: {
  //           operations: [
  //             {
  //               operation: 'Insert',
  //               instruction: {
  //                 table: 'cart_items',
  //                 name: "insertCartItem",
  //                 data: {
  //                   cart: cart.id,
  //                   product_cart: itemId,
  //                   qty: qty + 1,
  //                   subtotal: item.price * (qty + 1),
  //                 },
  //               },
  //             },
  //             {
  //               operation: 'Update',
  //               instruction: {
  //                 table: 'carts',
  //                 name: "UpdateCart",
  //                 condition: {
  //                   id: cart.id,
  //                   status: {
  //                     $eq: "draft"
  //                   }
  //                 },
  //                 set: {
  //                   total_price: cart.total_price + item.price,
  //                   grand_total: cart.total_price + item.price,
  //                 }
  //               },
  //             },
  //           ],
  //         },
  //       })
  //     } else {
  //       await client.project.axios({
  //         method: 'post',
  //         headers,
  //         url: `${url}/v1/execute`,
  //         data: {
  //           operations: [
  //             {
  //               operation: 'Update',
  //               instruction: {
  //                 table: 'cart_items',
  //                 name: "updateCartItem",
  //                 condition: {
  //                   cart: cart.id,
  //                   product_cart: itemId
  //                 },
  //                 set: {
  //                   qty: qty + 1,
  //                   subtotal: item.price * (qty + 1),
  //                 },
  //               },
  //             },
  //             {
  //               operation: 'Update',
  //               instruction: {
  //                 table: 'carts',
  //                 name: "UpdateCart",
  //                 condition: {
  //                   id: cart.id,
  //                   status: {
  //                     $eq: "draft"
  //                   }
  //                 },
  //                 set: {
  //                   total_price: cart.total_price + item.price,
  //                   grand_total: cart.total_price + item.price,
  //                 }
  //               },
  //             },
  //           ],
  //         },
  //       })
  //     }
  //   } catch (error) {
  //     throw new Error(error)
  //   }
  // }

  const handleAddToCart = async () => {
    setLoading(true)
    try {
      const response = await client.project.axios({
        method: 'post',
        headers,
        url: `${url}/v1/execute`,
        data: {
          operations: [
            {
              operation: 'Select',
              instruction: {
                table: 'carts',
                name: "data",
                condition: {
                  status: {
                    $eq: "Draft"
                  },
                  user_cart: {
                    $eq: userId
                  }
                },
              },
            }
          ],
        },
      })

      //if cart found, update cart
      if (response.data.results.data.length > 0) {
        await updateCart(response.data.results.data[0])
      } else { // if cart not found, insert new cart
        await insertCart()
      }

      setShowSuccess(true)
    } catch (error) {
      throw new Error(error)
    }
    setLoading(false)
  }

  const updateCart = async (cart) => {
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
                cart: cart.id
              },
            },
          },
        ]
      }
    })

    //find same product in cart
    const indexFound = response.data.results.data.findIndex(i => i.product_cart == item.id)

    //if product not found, insert cart item, and update summary cart
    if (indexFound < 0) {
      await client.project.axios({
        method: 'post',
        headers,
        url: `${url}/v1/execute`,
        data: {
          operations: [
            {
              operation: 'Insert',
              instruction: {
                table: 'cart_items',
                name: "insertCartItem",
                data: {
                  cart: cart.id,
                  product_cart: item.id,
                  qty: 1,
                  subtotal: item.price,
                  user_cart_item: userId,
                  service_place_id: item.service_place_products
                },
              },
            },
            {
              operation: 'Update',
              instruction: {
                table: 'carts',
                name: "UpdateCart",
                condition: {
                  id: cart.id,
                  status: {
                    $eq: "Draft"
                  }
                },
                set: {
                  total_price: cart.total_price + item.price,
                  grand_total: cart.total_price + item.price,
                }
              },
            },
          ]
        }
      })
    } else {//if product found, update cart item, and update summary cart
      await client.project.axios({
        method: 'post',
        headers,
        url: `${url}/v1/execute`,
        data: {
          operations: [
            {
              operation: 'Update',
              instruction: {
                table: 'cart_items',
                name: "updateCartItem",
                condition: {
                  cart: cart.id,
                  product_cart: item.id
                },
                set: {
                  qty: response.data.results.data[indexFound].qty + 1,
                  subtotal: item.price * (response.data.results.data[indexFound].qty + 1),
                },
              },
            },
            {
              operation: 'Update',
              instruction: {
                table: 'carts',
                name: "UpdateCart",
                condition: {
                  id: cart.id,
                  status: {
                    $eq: "Draft"
                  }
                },
                set: {
                  total_price: cart.total_price + item.price,
                  grand_total: cart.total_price + item.price,
                }
              },
            },
          ]
        }
      })
    }
  }

  const insertCart = async () => {
    //insert new cart and cart item
    await client.project.axios({
      method: 'post',
      headers,
      url: `${url}/v1/execute`,
      data: {
        operations: [
          {
            operation: 'Insert',
            instruction: {
              table: 'carts',
              name: "insertCart",
              data: {
                user_cart: userId,
                status: 'Draft',
                total_price: item.price,
                grand_total: item.price,
              },
            },
          },
          {
            operation: 'Insert',
            instruction: {
              table: 'cart_items',
              name: "insertCartItem",
              data: {
                cart: "{{insertCart[0].id}}",
                product_cart: item.id,
                qty: 1,
                subtotal: item.price,
                user_cart_item: userId,
                service_place_id: item.service_place_products
              },
            },
          },
        ]
      }
    })
  }

  return (
    <Box
      borderColor={{ base: "gray.200", md: "none" }}
      key={itemId}
      bg="#FFFFFF"
      borderRadius="4px"
    >
      <Box
        flex={1}
        flexDirection="row"
        noOfLines={4}
        p={4}
        cursor='pointer'
        onClick={action.handleClick}
      >
        <Center>
          <Image
            boxSize="120px"
            objectFit="cover"
            src={imageSource}
            alt={title}
          />
        </Center>

        <Text fontSize="md" noOfLines={2} >
          {title}
        </Text>
        <Text
          fontSize="md"
          noOfLines={1}
          fontWeight="bold"
          color="blue.500"
          mt={2}
        >
          {price}
        </Text>
        <Text fontSize="sm" fontWeight={'semibold'} noOfLines={1} >
          {storeName}
        </Text>
      </Box>

      <Box
        flex={1}
        flexDirection="row"
      >
        <Button
          colorScheme='gray'
          width="full"
          variant='outline'
          size={'sm'}
          mt={2}
          disabled={item.quantity <= 0 || loading}
          onClick={handleAddToCart}
        >
          <span style={{ fontSize: '12px' }}>
            {showSuccess ?
              <ScaleFade initialScale={0.4} in={showSuccess}>
                <Badge color={'green.500'} textTransform={'none'}>
                  ✓ Berhasil
                </Badge>
              </ScaleFade>
              :
              '+ Keranjang'
            }
          </span>
        </Button>
      </Box>
    </Box>
  )
}

const LoaderItem: React.FC = () => (
  <Grid templateColumns="repeat(12, 1fr)" gap={4}>
    <GridItem colSpan={9}>
      <Skeleton height="16px" width="100%" borderRadius="lg" mb={1} />
      <Stack spacing="4px">
        <Skeleton height="16px" width="50%" borderRadius="lg" />
        <Skeleton height="16px" borderRadius="lg" />
        <Skeleton height="16px" borderRadius="lg" />
        <Skeleton height="16px" borderRadius="lg" />
      </Stack>
    </GridItem>
    <GridItem colSpan={3}>
      <Center w="100%" h="100%">
        <Skeleton boxSize="64px" borderRadius="lg" />
      </Center>
    </GridItem>
  </Grid>
);

const ListProduct = registerComponent("Petloop Product Cart", {
  type: "list",
  icon: "IconListUl",
  group: "list",
  defaultProps: {
    header: "List",
    userId: "",
    imageSource: "https://via.placeholder.com/150",
    title: "Title",
    price: "Price",
    storeName: "Store Name",
    action: { type: 'none' },
    // action2: { type: 'none' },
    seeAllAction: { type: "none" },
  },
  propDefinition: {
    header: {
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
    imageSource: { group: "Thumbnail", type: "string", options: { format: "text" } },
    title: { group: "Design", type: "string", options: { format: "text" } },
    price: { group: "Design", type: "string", options: { format: "text" } },
    storeName: { group: "Design", type: "string", options: { format: "text" } },
    action: {
      group: 'Action',
      type: 'action',
      label: "Item Action",
      options: { type: 'none' }
    },
    // action2: {
    //   group: 'Action',
    //   type: 'action',
    //   label: "Item Action 2",
    //   options: { type: 'none' }
    // },
    seeAllAction: {
      group: "Action",
      type: "action",
      label: "See All Action",
      options: { type: "none" },
    },
  },
  Component: (props) => {
    const client = props.hooks.useClient()
    const { rows, loading, error, revalidate } = props.data.component

    if (loading) {
      return (
        <Stack spacing="7" p={4}>
          {Array(2)
            .fill(null)
            .map(() => (
              <LoaderItem />
            ))}
        </Stack>
      );
    }

    return (
      <Box padding="8px" pt="0" mt="0" h="min-content">
        <Box
          p={2}
          pt={4}
          pb={4}
        >
          <SimpleGrid columns={2} spacing={4}>
            {rows.map((item) => (
              <props.components.ListItemVariables key={item.id} variables={item}>
                <Item key={item.id} item={item} {...props} />
              </props.components.ListItemVariables>
            ))}
          </SimpleGrid>
        </Box>
      </Box>
    )
  }
})

export default ListProduct