import {
  Box,
  HStack,
  List,
  ListItem,
  Text,
  Skeleton,
  useColorModeValue,
  Grid,
  GridItem,
  Stack,
  Divider,
  Flex,
  Button,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Input,
  useNumberInput,
  IconButton,
  VStack,
} from '@chakra-ui/react'
import { registerComponent } from '@qorebase/app-cli'
import React from 'react'
import { IconDelete } from '@feedloop/icon'

const url = 'https://staging-qore-data-teacher-593643.qore.dev'
const headers = {
  accept: '*/*',
  'x-qore-engine-admin-secret': 'UM5MlKofJjxhC0KQejD8WZi2cmbpAN5A',
}

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
  } & typeof BillComponent['component']['Component']['defaultProps'],
) => {
  const { item, client, revalidate } = props
  const itemId = item.id || props.source.itemId
  const listDividerColor = useColorModeValue('gray.200', 'gray.600')

  const itemName =
    item.product_name || item.medical_name || item.appointment_service

  const itemPrice =
    item.product_price || item.medical_price || item.appointment_price || 0

  const itemStock = item.product_stock || item.medical_stock || 1

  const {
    getInputProps,
    getIncrementButtonProps,
    getDecrementButtonProps,
  } = useNumberInput({
    step: 1,
    defaultValue: item.quantity,
    min: 1,
    max: itemStock,
    precision: 0,
  })

  const inc = getIncrementButtonProps()
  const dec = getDecrementButtonProps()
  const input = getInputProps()

  async function removeItem(id) {
    if (!id) return
    await client.project.axios({
      method: 'delete',
      url: `${url}/v1/table/bill_items/row/${id}`,
      headers,
    })
    revalidate()
  }

  const updateBillItem = async (id: string, qty: number, price: number) => {
    try {
      if (qty == 0) {
        removeItem(id)
      }
      const response = await client.project.axios({
        method: 'post',
        headers,
        url: `${url}/v1/execute`,
        data: {
          operations: [
            {
              operation: 'Update',
              instruction: {
                table: 'bill_items',
                name: 'updateBillItem',
                condition: {
                  id: id,
                },
                set: {
                  quantity: qty,
                  grand_total: price * qty,
                },
              },
            },
          ],
        },
      })
      revalidate()
      return response.data
    } catch (error) {
      throw new Error(error)
    }
  }

  const totalItemPrice = React.useMemo(() => {
    if (!item) return 0
    let inputQty = input['aria-valuenow']
    const itemPrice =
      item.product_price || item.medical_price || item.appointment_price || 0
    return inputQty * itemPrice
  }, [item, input])

  return (
    <Popover
      onClose={() => {
        updateBillItem(
          item.id,
          input['aria-valuenow'],
          item.product_price || item.medical_price || item.appointment_price,
        )
      }}
    >
      <PopoverTrigger>
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
            <HStack>
              <VStack w={['100%', 'full', '100%']}>
                <Text
                  fontSize="sm"
                  noOfLines={5}
                  fontWeight="semibold"
                  textAlign="left"
                >
                  {input['aria-valuenow']} x {itemName}
                </Text>
              </VStack>
            </HStack>
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
          <Text
            fontSize="xs"
            w="40%"
            textAlign="left"
            fontWeight="normal"
            color="gray.600"
          >
            @{formatRupiah(itemPrice)}
          </Text>
        </ListItem>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>{itemName}</PopoverHeader>
        <PopoverBody pt="5px">
          <Flex justifyContent="space-between" pt="5px">
            <IconButton
              variant="outline"
              colorScheme="red"
              aria-label="Call Sage"
              fontSize="20px"
              icon={<IconDelete />}
              onClick={() => removeItem(item.id)}
            />
            <HStack maxW="220px">
              <Button {...dec}>-</Button>
              <Input {...input} />
              <Button {...inc}>+</Button>
            </HStack>
          </Flex>
        </PopoverBody>
      </PopoverContent>
    </Popover>
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

const BillComponent = registerComponent('Bills', {
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
    // const { data = [], status, revalidate } = sourceHooks.useFetchList({
    //   ...props.source.params,
    //   ...(props.source.sorts.field
    //     ? {
    //         orderBy: {
    //           [props.source.sorts.field]: props.source.sorts.type,
    //         },
    //       }
    //     : null),
    // })

    const [bill, setBill] = React.useState<any | null>()
    const [downPayment, setDownPayment] = React.useState<number>(0)

    React.useEffect(() => {
      if (billId === 'none' || !billId) return
      ;(async () => {
        const bill = await client.project.axios({
          method: 'get',
          url: `${url}/v1/table/bills/row/${billId.toString()}`,
          headers,
        })
        if (bill) setBill(bill.data)
        setDownPayment(bill.data.down_payment_amount)
      })()
    }, [billId, data])

    const subtotal = React.useMemo(() => {
      if (!data) return 0
      let sum = 0
      data.forEach((item) => (sum += item.grand_total))
      return sum
    }, [data])

    const returnAmount = React.useMemo(() => {
      if (!data) return 0
      const result = subtotal >= downPayment ? 0 : subtotal - downPayment
      return result
    }, [data])

    const action = props.hooks.useActionTrigger(
      props.properties.action,
      props.data.page.row,
      props.pageSource,
    )

    const proceedToPayment = async (id: string) => {
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
                  table: 'bills',
                  name: 'UpdateBill',
                  condition: {
                    id: id,
                  },
                  set: {
                    status: 'Complete',
                    total_price: subtotal,
                    grand_total:
                      subtotal < downPayment
                        ? subtotal
                        : subtotal - downPayment,
                    date: new Date(),
                    is_current_bills: false,
                    return_amount: Math.abs(returnAmount),
                  },
                },
              },
            ],
          },
        })
        action.handleClick()
      } catch (error) {
        throw new Error(error)
      }
    }

    if (status === 'loading') {
      return (
        <Stack spacing="7" p={4}>
          <LoaderItem />
        </Stack>
      )
    }

    const removeItems = async (items) => {
      if (!items) return
      setDownPayment(0)

      items.forEach(
        async (item) =>
          await client.project.axios({
            method: 'delete',
            url: `${url}/v1/table/bill_items/row/${item.id}`,
            headers,
          }),
      )

      await client.project.axios({
        method: 'post',
        url: `${url}/v1/execute`,
        headers,
        data: {
          operations: [
            {
              operation: 'Update',
              instruction: {
                table: 'bills',
                name: 'UpdateBills',
                condition: {
                  id: billId,
                  status: {
                    $eq: 'Draft',
                  },
                  is_current_bills: {
                    $eq: 'true',
                  },
                },
                set: {
                  bill_down_payment: null,
                },
              },
            },
          ],
        },
      })

      revalidate()
    }

    return (
      <Box padding="8px 16px 8px 16px">
        <Box
          h="auto"
          minHeight={'10px'}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          padding={'5px 0px'}
          marginBottom={'2px'}
        >
          <Text fontWeight="bold" fontSize="md">
            Tagihan saat ini
          </Text>
        </Box>
        <Text fontWeight="normal" color="gray.400" fontSize="sm">
          {bill?.bill_id ? `ID ${bill?.bill_id}` : 'Browse dan tambahkan item'}
        </Text>
        <Divider p="3px" color="gray.300" />
        <List mt="3px">
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
        <Box padding={'5px 5px'}>
          <Divider mt="10px" mb="10px" color="gray.300" />
          <Flex mt="10px" w="full" justifyContent="space-between">
            <Text fontSize="md" noOfLines={1}>
              Subtotal
            </Text>
            <Text fontSize="md" fontWeight="semibold" noOfLines={1}>
              {formatRupiah(subtotal)}
            </Text>
          </Flex>
          <Flex mt="10px" w="full" justifyContent="space-between">
            <Text fontSize="md" noOfLines={1}>
              UANG MUKA
            </Text>
            <Text
              fontSize="md"
              fontWeight="semibold"
              noOfLines={1}
              color="red.600"
            >
              (
              {bill &&
                bill?.down_payment_amount !== 'null' &&
                formatRupiah(bill?.down_payment_amount)}
              )
            </Text>
          </Flex>
          <Flex mt="10px" w="full" justifyContent="space-between">
            <Text fontSize="md" noOfLines={1}>
              TOTAL
            </Text>
            <Text fontSize="md" fontWeight="semibold" noOfLines={1}>
              {formatRupiah(
                subtotal <= downPayment ? subtotal : subtotal - downPayment,
              )}
            </Text>
          </Flex>

          <Divider mt="10px" mb="10px" color="gray.300" />
          <Flex
            visibility={subtotal <= downPayment ? 'visible' : 'hidden'}
            mt="10px"
            w="full"
            justifyContent="space-between"
          >
            <Text fontSize="md" noOfLines={1}>
              Total Kembalian
            </Text>
            <Text fontSize="md" fontWeight="semibold" noOfLines={1}>
              {formatRupiah(Math.abs(returnAmount))}
            </Text>
          </Flex>
          <Flex justifyContent="space-between" mt="20px" w="full">
            <Button
              isLoading={false}
              loadingText="Submitting"
              variant="outline"
              w="48%"
              onClick={async () => {
                await removeItems(data)
                revalidate()
              }}
              isDisabled={!data.length && !downPayment}
            >
              Hapus Tagihan
            </Button>
            <Button
              w="48%"
              isLoading={false}
              colorScheme="blue"
              variant="solid"
              isDisabled={!data.length}
              onClick={() => proceedToPayment(billId)}
            >
              Proses Bayar
            </Button>
          </Flex>
        </Box>
      </Box>
    )
  },
})

export default BillComponent
