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
  Checkbox,
} from '@chakra-ui/react'
import { registerComponent } from '@qorebase/app-cli'

const url = 'https://staging-qore-data-jewellery-713559.qore.dev'
const headers = {
  accept: '*/*',
  'x-qore-engine-admin-secret': 'qTWuRX0a1erpTSTunr8RxluoeXIs3ejD',
}

function Item(props) {
  const { item } = props

  const itemId = props.hooks.useTemplate(item.id || props.source.itemId)
  const imageSource = props.hooks.useTemplate(props.properties.imageSource)
  const title = props.hooks.useTemplate(props.properties.title)
  const price = props.hooks.useTemplate(props.properties.price)

  const [loading, setLoading] = React.useState(false)
  const [quantity, setQty] = React.useState(item.quantity)

  const client = props.hooks.useClient()

  const rupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(number)
  }

  const increment = async () => {
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
                  id: itemId,
                },
                set: {
                  quantity: quantity + 1,
                  subtotal: Number(item.variant_price) * (quantity + 1),
                },
              },
            },
          ],
        },
      })

      setQty(quantity + 1)
    } catch (error) {
      throw new Error(error)
    }
    props.revalidate()
    setLoading(false)
  }

  const decrement = async () => {
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
                  id: itemId,
                },
                set: {
                  quantity: quantity - 1,
                  subtotal: Number(item.variant_price) * (quantity - 1),
                },
              },
            },
          ],
        },
      })

      setQty(quantity - 1)
    } catch (error) {
      throw new Error(error)
    }
    props.revalidate()
    setLoading(false)
  }

  const remove = async () => {
    setLoading(true)
    try {
      await client.project.axios({
        method: 'post',
        headers,
        url: `${url}/v1/execute`,
        data: {
          operations: [
            {
              operation: 'Delete',
              instruction: {
                table: 'cart_items',
                name: 'DeleteCartItem',
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
    props.revalidate()
    setLoading(false)
  }

  if (quantity <= 0) return null

  return (
    <Box
      borderColor={{ base: 'gray.200', md: 'none' }}
      key={itemId}
      bg="#FFFFFF"
      borderRadius="4px"
    >
      <Box flex={1} flexDirection="column" noOfLines={4} p={2}>
        <Flex alignItems={'center'} gap="3">
          <Image
            boxSize="100px"
            objectFit="cover"
            src={imageSource}
            alt={title}
          />

          <Box flex={1} flexDirection="row" noOfLines={4} p={2}>
            <Text fontSize="md" fontWeight={'bold'} noOfLines={2}>
              {title}
            </Text>

            <Flex justifyContent={'space-between'}>
              <Text
                fontSize="sm"
                noOfLines={1}
                fontWeight="bold"
                color="blue.500"
                mt={2}
              >
                {price}
              </Text>
            </Flex>

            <Text fontSize="sm" fontWeight={'semibold'} noOfLines={1}>
              {rupiah(+item.variant_price * +quantity)}
            </Text>

            <Flex mt={2} justifyContent={'space-between'}>
              <Checkbox
                borderColor="gray.200"
                disabled={loading}
                visibility="hidden"
              ></Checkbox>
              <HStack pb={2}>
                <Button
                  size={'sm'}
                  backgroundColor={'#F56565'}
                  color={'#FFF'}
                  onClick={remove}
                  disabled={loading}
                >
                  x
                </Button>
                <Button
                  size={'sm'}
                  colorScheme="blue"
                  onClick={decrement}
                  disabled={quantity == 1 || loading}
                >
                  -
                </Button>
                <Input
                  size={'sm'}
                  value={quantity}
                  textAlign={'center'}
                  width={'50px'}
                  borderColor={'#f1f1f1'}
                  readOnly
                />
                <Button
                  size={'sm'}
                  colorScheme="blue"
                  onClick={increment}
                  disabled={loading}
                >
                  +
                </Button>
              </HStack>
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
)

export default registerComponent('Amoda Cart', {
  type: 'list',
  icon: 'IconX',
  group: 'list',
  defaultProps: {
    header: 'List',
    imageSource: 'https://via.placeholder.com/150',
    title: 'Title',
    price: 'Price',
  },
  propDefinition: {
    header: {
      type: 'string',
      options: {
        format: 'text',
      },
    },
    imageSource: {
      group: 'Thumbnail',
      type: 'string',
      options: { format: 'text' },
    },
    title: { group: 'Design', type: 'string', options: { format: 'text' } },
    price: { group: 'Design', type: 'string', options: { format: 'text' } },
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
      )
    }

    return (
      <Box padding="8px" pt="0" mt="0" h="min-content" bg="#FFFFFF">
        <Box p={2} pt={4} pb={4}>
          <SimpleGrid columns={1} spacing={2}>
            {rows.map((item) => (
              <props.components.ListItemVariables
                key={item.id}
                variables={item}
              >
                <Item
                  key={item.id}
                  item={item}
                  {...props}
                  revalidate={revalidate}
                />
              </props.components.ListItemVariables>
            ))}
          </SimpleGrid>
        </Box>
      </Box>
    )
  },
})
