import { registerComponent } from "@qorebase/app-cli";
import React from 'react'
import {
  Box,
  Button,
  HStack,
  Stack,
  Image,
  Input,
  SimpleGrid,
  Text,
  Flex,
  Grid,
  GridItem,
  Skeleton,
  Center,
  Checkbox
} from '@chakra-ui/react'

const url = 'https://staging-qore-data-teacher-593643.qore.dev'
const headers = {
  accept: '*/*',
  'x-qore-engine-admin-secret': 'UM5MlKofJjxhC0KQejD8WZi2cmbpAN5A',
}

function Item(props) {
  const { item } = props

  const itemId = props.hooks.useTemplate(item.id || props.source.itemId)

  const imageSource = props.hooks.useTemplate(props.properties.imageSource)
  const title = props.hooks.useTemplate(props.properties.title)
  const price = props.hooks.useTemplate(props.properties.price)
  const stock = props.hooks.useTemplate(props.properties.stock)
  const storeName = props.hooks.useTemplate(props.properties.storeName)

  const [loading, setLoading] = React.useState(false)
  const [qty, setQty] = React.useState(item.qty)
  const [isSelected, setIsSelected] = React.useState(item.is_selected)

  const client = props.hooks.useClient()

  // const actionIncrement = props.hooks.useActionTrigger(
  //   props.properties.actionIncrement,
  //   props.data.page.row,
  //   props.pageSource,
  // )

  // const actionDecrement = props.hooks.useActionTrigger(
  //   props.properties.actionDecrement,
  //   props.data.page.row,
  //   props.pageSource,
  // )

  // const actionRemove = props.hooks.useActionTrigger(
  //   props.properties.actionRemove,
  //   props.data.page.row,
  //   props.pageSource,
  // )

  const increment = async () => {
    setLoading(true)
    try {
      //get cart by id
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
                  id: item.cart,
                  status: {
                    $eq: "Draft"
                  },
                },
              },
            }
          ]
        }
      })

      if (!response.data.results.data.length) {
        throw new Error("Cart tidak ditemukan!")
      }

      const cart = response.data.results.data[0]

      //update cart summary, and update cart item
      await client.project.axios({
        method: 'post',
        headers,
        url: `${url}/v1/execute`,
        data: {
          operations: [
            {
              operation: 'Update',
              instruction: {
                table: 'carts',
                name: "UpdateCart",
                condition: {
                  id: item.cart,
                  status: {
                    $eq: "Draft"
                  }
                },
                set: {
                  total_price: (Number(cart.total_price) + Number(item.price)),
                  grand_total: (Number(cart.total_price) + Number(item.price)),
                }
              },
            },
            {
              operation: 'Update',
              instruction: {
                table: 'cart_items',
                name: "UpdateCartItem",
                condition: {
                  id: itemId,
                },
                set: {
                  qty: qty + 1,
                  subtotal: Number(item.price) * (qty + 1),
                }
              },
            },
          ],
        },
      })

      setQty(qty + 1)
    } catch (error) {
      throw new Error(error)
    }
    setLoading(false)
  }

  const decrement = async () => {
    setLoading(true)
    try {
      //get cart by id
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
                  id: item.cart,
                  status: {
                    $eq: "Draft"
                  },
                },
              },
            }
          ]
        }
      })

      if (!response.data.results.data.length) {
        throw new Error("Cart tidak ditemukan!")
      }

      const cart = response.data.results.data[0]

      //update cart summary, and update cart item
      await client.project.axios({
        method: 'post',
        headers,
        url: `${url}/v1/execute`,
        data: {
          operations: [
            {
              operation: 'Update',
              instruction: {
                table: 'carts',
                name: "UpdateCart",
                condition: {
                  id: item.cart,
                  status: {
                    $eq: "Draft"
                  }
                },
                set: {
                  total_price: (Number(cart.total_price) - Number(item.price)),
                  grand_total: (Number(cart.total_price) - Number(item.price)),
                }
              },
            },
            {
              operation: 'Update',
              instruction: {
                table: 'cart_items',
                name: "UpdateCartItem",
                condition: {
                  id: itemId,
                },
                set: {
                  qty: qty - 1,
                  subtotal: Number(item.price) * (qty - 1),
                }
              },
            },
          ],
        },
      })

      setQty(qty - 1)
    } catch (error) {
      throw new Error(error)
    }
    setLoading(false)
  }

  const remove = async () => {
    setLoading(true)
    try {
      //get cart by id
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
                  id: item.cart,
                  status: {
                    $eq: "Draft"
                  },
                },
              },
            }
          ]
        }
      })

      if (!response.data.results.data.length) {
        throw new Error("Cart tidak ditemukan!")
      }

      const cart = response.data.results.data[0]

      //update cart summary, and remove cart item
      await client.project.axios({
        method: 'post',
        headers,
        url: `${url}/v1/execute`,
        data: {
          operations: [
            {
              operation: 'Update',
              instruction: {
                table: 'carts',
                name: "UpdateCart",
                condition: {
                  id: item.cart,
                  status: {
                    $eq: "Draft"
                  }
                },
                set: {
                  total_price: (Number(cart.total_price) - (Number(item.price) * qty)),
                  grand_total: (Number(cart.total_price) - (Number(item.price) * qty)),
                }
              },
            },
            {
              operation: 'Delete',
              instruction: {
                table: 'cart_items',
                name: "DeleteCartItem",
                condition: {
                  id: itemId,
                },
              },
            },
          ],
        },
      })

      setQty(0)
    } catch (error) {
      throw new Error(error)
    }
    setLoading(false)
  }

  const selectProduct = async (checked) => {
    setLoading(true)
    try {
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
                name: 'UpdateCartItem',
                condition: {
                  id: itemId
                },
                set: {
                  is_selected: checked
                },
              },
            },
          ],
        },
      })

      setIsSelected(checked)
    } catch (error) {
      throw new Error(error)
    }
    setLoading(false)
  }

  if (qty <= 0) return null

  return (
    <Box
      borderColor={{ base: "gray.200", md: "none" }}
      key={itemId}
      bg="#FFFFFF"
      borderRadius="4px"
    >
      <Box flex={1} flexDirection="column" noOfLines={4} p={2}>
        <Flex alignItems={'center'}>
          <Box p={2}>
            <Image
              boxSize='60px'
              objectFit='cover'
              src={imageSource}
              alt={title}
            />
          </Box>

          <Box flex={1} flexDirection="row" noOfLines={4} p={2}>
            {/* <Text fontSize="sm" noOfLines={2} >
              {title}
            </Text> */}

            {/* <Checkbox
              borderColor="gray.200"
              isChecked={isSelected}
              onChange={(e) => selectProduct(e.target.checked)}
              pl={2}
            > */}
            <Text fontSize="sm" noOfLines={2} >
              {title}
            </Text>
            {/* </Checkbox> */}

            <Flex justifyContent={'space-between'}>
              <Text
                fontSize="sm"
                noOfLines={1}
                fontWeight="bold"
                color='blue.500'
                mt={2}
              >
                {price}
              </Text>

              <Text
                fontSize="sm"
                noOfLines={1}
                mt={2}
                color={item.quantity <= 0 ? 'red.500' : 'gray.500'}
              >
                {stock <= 0 ? 'Stok habis' : 'Stok: ' + stock}
              </Text>
            </Flex>

            <Text fontSize="sm" fontWeight={'semibold'} noOfLines={1} >
              {storeName}
            </Text>

            <Flex mt={2} justifyContent={'space-between'}>
              <Checkbox
                borderColor="gray.200"
                isChecked={isSelected}
                disabled={loading}
                onChange={(e) => selectProduct(e.target.checked)}></Checkbox>
              <HStack pb={2}>
                <Button
                  size={'sm'}
                  backgroundColor={'#F56565'}
                  color={'#FFF'}
                  onClick={remove}
                  disabled={loading}
                >x</Button>
                <Button
                  size={'sm'}
                  colorScheme='blue'
                  onClick={decrement}
                  disabled={qty == 1 || loading}
                >-</Button>
                <Input
                  size={'sm'}
                  value={qty}
                  textAlign={'center'}
                  width={'50px'}
                  borderColor={'#f1f1f1'}
                  readOnly
                />
                <Button
                  size={'sm'}
                  colorScheme='blue'
                  onClick={increment}
                  disabled={item.quantity == qty || loading}
                >+</Button>
              </HStack>
              {/* <HStack pb={2}>
                <Button
                  size={'sm'}
                  backgroundColor={'#F56565'}
                  color={'#FFF'}
                  onClick={actionRemove.handleClick}
                >x</Button>
                <Button
                  size={'sm'}
                  colorScheme='blue'
                  onClick={actionDecrement.handleClick}
                  disabled={item.qty == 1}
                >-</Button>
                <Input
                  size={'sm'}
                  value={item.qty}
                  textAlign={'center'}
                  width={'50px'}
                  borderColor={'#f1f1f1'}
                  readOnly
                />
                <Button
                  size={'sm'}
                  colorScheme='blue'
                  onClick={actionIncrement.handleClick}
                  disabled={item.quantity == item.qty}
                >+</Button>
              </HStack> */}
            </Flex>
          </Box>
        </Flex>
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

export default registerComponent("Petloop Cart", {
  type: "list",
  icon: "IconX",
  group: "list",
  defaultProps: {
    header: "List",
    imageSource: "https://via.placeholder.com/150",
    title: "Title",
    price: "Price",
    stock: "0",
    storeName: "Store Name",
    // actionIncrement: { type: 'none' },
    // actionDecrement: { type: 'none' },
    // actionRemove: { type: 'none' },
  },
  propDefinition: {
    header: {
      type: "string",
      options: {
        format: "text",
      },
    },
    imageSource: { group: "Thumbnail", type: "string", options: { format: "text" } },
    title: { group: "Design", type: "string", options: { format: "text" } },
    price: { group: "Design", type: "string", options: { format: "text" } },
    stock: { group: "Design", type: "string", options: { format: "text" } },
    storeName: { group: "Design", type: "string", options: { format: "text" } },
    // actionIncrement: {
    //   group: 'Action',
    //   type: 'action',
    //   label: "Item Action Increment",
    //   options: { type: 'none' }
    // },
    // actionDecrement: {
    //   group: 'Action',
    //   type: 'action',
    //   label: "Item Action Decrement",
    //   options: { type: 'none' }
    // },
    // actionRemove: {
    //   group: 'Action',
    //   type: 'action',
    //   label: "Item Action Remove",
    //   options: { type: 'none' }
    // },
  },
  Component: (props) => {
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
          <SimpleGrid columns={1} spacing={2}>
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