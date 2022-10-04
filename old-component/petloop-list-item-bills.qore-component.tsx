import {
  Box,
  List,
  ListItem,
  Text,
  Skeleton,
  useColorModeValue,
  Grid,
  GridItem,
  Stack,
  Flex,
  VStack,
  Image,
} from '@chakra-ui/react'
import React from 'react'
import { registerComponent } from '@qorebase/app-cli'

function formatRupiah(numb) {
  if (!numb) return 0
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(numb)
}

const Item = (
  props: {
    item: any
    client: any
    billId: any
    revalidate: () => void
  } & typeof ListItemBill['component']['Component']['defaultProps'],
) => {
  const { item } = props
  const itemId = item.id || props.source.itemId
  const listDividerColor = useColorModeValue('gray.200', 'gray.600')

  const itemName =
    item.product_name || item.medical_name || item.appointment_service

  const itemPrice =
    item.product_price || item.medical_price || item.appointment_price || 0

  const image = item.product_image || item.medical_image || item.service_image

  const totalItemPrice = React.useMemo(() => {
    if (!item) return 0
    let inputQty = item.quantity
    const itemPrice =
      item.product_price || item.medical_price || item.appointment_price || 0
    return inputQty * itemPrice
  }, [item, item.quantity])

  return (
    <ListItem
      w={['full', 'full']}
      bg="#fff"
      mt="5px"
      key={itemId}
      fontSize="larger"
      p={4}
      borderRadius="4px"
      borderColor={{ base: listDividerColor, md: 'none' }}
      cursor="pointer"
    >
      <Flex w="full" justifyContent="space-between">
        <Image
          src={`https://${image}`}
          alt="item"
          w="60px"
          h="60px"
          rounded={'sm'}
          fallbackSrc="https://via.placeholder.com/150"
        />
        <VStack w={['120px', 'full', '100%']} textAlign="left" ml="5">
          <Text
            fontSize="sm"
            noOfLines={4}
            fontWeight="semibold"
            textAlign="left"
            w={'full'}
          >
            {itemName}
          </Text>
          <Text
            w={'full'}
            fontSize="xs"
            textAlign="left"
            fontWeight="normal"
            color="gray.600"
          >
            {item.quantity} x {formatRupiah(itemPrice)}
          </Text>
        </VStack>
        <Text
          fontSize="md"
          fontWeight="semibold"
          w="40%"
          noOfLines={1}
          textAlign="right"
        >
          {formatRupiah(totalItemPrice)}
        </Text>
      </Flex>
    </ListItem>
  )
}

const LoaderItem: React.FC = () => (
  <Grid templateColumns="repeat(1, 1fr)" gap={4}>
    <GridItem>
      <Text fontWeight="bold" fontSize="md" mb="5px">
        Tagihan saat ini
      </Text>
      <Stack spacing="4px">
        <Skeleton height="12px" width="100%" borderRadius="lg" />
        <Skeleton height="12px" borderRadius="lg" />
        <Skeleton height="12px" borderRadius="lg" />
        <Skeleton height="12px" borderRadius="lg" />
      </Stack>
    </GridItem>
  </Grid>
)

const ListItemBill = registerComponent('List Bill Item', {
  type: 'list',
  icon: 'IconListUl',
  group: 'list',
  defaultProps: {
    billId: '',
    action: { type: 'none' },
  },
  propDefinition: {
    billId: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },

    action: {
      group: 'Action',
      type: 'action',
      label: 'Item Action',
      options: { type: 'none' },
    },
  },
  Component: (props) => {
    const client = props.hooks.useClient()
    const billId = props.hooks.useTemplate(props.properties.billId)
    const { rows: data, loading, error, revalidate } = props.data.component

    if (loading) {
      return (
        <Stack spacing="7" p={4}>
          <LoaderItem />
        </Stack>
      )
    }

    return (
      <Box padding="8px 16px 8px 16px">
        <List mt="5px">
          {!props.source.target ? (
            <Item
              item={props.data.page.row}
              {...props}
              client={client}
              billId={billId}
              revalidate={revalidate}
            />
          ) : data.length ? (
            data?.map((item) => (
              <props.components.ListItemVariables
                key={item.id}
                variables={item}
              >
                <Item
                  key={item.id}
                  item={item}
                  {...props}
                  client={client}
                  billId={billId}
                  revalidate={revalidate}
                />
              </props.components.ListItemVariables>
            ))
          ) : (
            <Text w="full" textAlign="center" color="gray.300" p="5">
              Belum ada Item
            </Text>
          )}
        </List>
      </Box>
    )
  },
})

export default ListItemBill
