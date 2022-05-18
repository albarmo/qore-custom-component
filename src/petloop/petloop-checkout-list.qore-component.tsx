import { registerComponent } from "@qorebase/app-cli";
import React from 'react'

import {
  Box,
  HStack,
  Stack,
  Text,
  Flex,
  Grid,
  GridItem,
  Skeleton,
  Center,
  Divider,
  List,
  ListItem
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

  const title = props.hooks.useTemplate(props.properties.title);
  const price = props.hooks.useTemplate(props.properties.price);
  const qty = props.hooks.useTemplate(props.properties.qty);
  const subtotal = props.hooks.useTemplate(props.properties.subtotal);

  return (
    <ListItem
      bg="#fff"
      mt="5px"
      fontSize="larger"
      p={4}
      key={itemId}
      borderRadius="4px"
      borderColor={{ base: 'gray.200', md: 'none' }}
    >
      <Flex w="full" justifyContent="space-between">
        <HStack>
          <Text fontSize="md" noOfLines={1} fontWeight="semibold">
            {qty} x
          </Text>
          <Text fontSize="sm" noOfLines={2} fontWeight="semibold">
            {title}
          </Text>
        </HStack>
        <Text fontSize="md" fontWeight="semibold" noOfLines={1}>
          {subtotal}
        </Text>
      </Flex>
      <Text fontSize="xs">
        @{price}
      </Text>
    </ListItem>
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

export default registerComponent("Petloop Checkout List", {
  type: "list",
  icon: "IconX",
  group: "list",
  defaultProps: {
    header: "Tagihan Saat Ini",
    title: "Title",
    price: "Price",
    qty: "0",
    subtotal: "0",
    subtotalTransaction: "0",
    discountTransaction: "0",
    totalTransaction: "0",
  },
  propDefinition: {
    header: {
      type: "string",
      options: {
        format: "text",
      },
    },
    title: { group: "Design", type: "string", options: { format: "text" } },
    price: { group: "Design", type: "string", options: { format: "text" } },
    qty: { group: "Design", type: "string", options: { format: "text" } },
    subtotal: { group: "Design", type: "string", options: { format: "text" } },
    subtotalTransaction: { group: "Design", type: "string", options: { format: "text" } },
    discountTransaction: { group: "Design", type: "string", options: { format: "text" } },
    totalTransaction: { group: "Design", type: "string", options: { format: "text" } },
  },
  Component: (props) => {
    const { rows, loading, error, revalidate } = props.data.component

    const header = props.hooks.useTemplate(props.properties.header)
    const subtotalTransaction = props.hooks.useTemplate(props.properties.subtotalTransaction)
    const discountTransaction = props.hooks.useTemplate(props.properties.discountTransaction)
    const totalTransaction = props.hooks.useTemplate(props.properties.totalTransaction)

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
      <Box padding="8px 16px 8px 16px">
        <Box
          h="auto"
          minHeight={'10px'}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          padding={'5px 5px'}
          marginBottom={'2px'}
        >
          <Text fontWeight="bold" fontSize="md">
            {header}
          </Text>
        </Box>
        <Divider p="3px" color="gray.300" />
        <List mt="3px">
          <Grid
            templateColumns={{
              base: 'none',
            }}
            gap={{
              base: '2px',
            }}
          >
            {rows.map((item) => (
              <props.components.ListItemVariables key={item.id} variables={item}>
                <Item key={item.id} item={item} {...props} />
              </props.components.ListItemVariables>
            ))}
          </Grid>
        </List>

        <Box padding={'5px 5px'}>
          <Divider mt="10px" mb="10px" color="gray.300" />
          <Flex mt="10px" w="full" justifyContent="space-between">
            <Text fontSize="md" noOfLines={1}>
              Subtotal
            </Text>
            <Text fontSize="md" fontWeight="semibold" noOfLines={1}>
              {subtotalTransaction}
            </Text>
          </Flex>
          <Flex mt="10px" w="full" justifyContent="space-between">
            <Text fontSize="md" noOfLines={1}>
              Diskon
            </Text>
            <Text
              fontSize="md"
              fontWeight="semibold"
              noOfLines={1}
              color="red.600"
            >
              ({discountTransaction})
            </Text>
          </Flex>
          <Flex mt="10px" w="full" justifyContent="space-between">
            <Text fontSize="md" noOfLines={1}>
              TOTAL
            </Text>
            <Text fontSize="md" fontWeight="semibold" noOfLines={1}>
              {totalTransaction}
            </Text>
          </Flex>
        </Box>
      </Box>
    )
  }
})