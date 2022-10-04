import React from 'react'
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
  Badge,
} from '@chakra-ui/react'
import { registerComponent, Row } from '@qorebase/app-cli'
import { Calender } from '@feedloop/icon'

const Item = (
  props: {
    item: Row
  } & typeof StatusListComponent['component']['Component']['defaultProps'],
) => {
  const { item } = props
  const itemId = props.hooks.useTemplate(item.id || props.source.itemId)
  const listDividerColor = useColorModeValue('gray.200', 'gray.600')
  const title = props.hooks.useTemplate(props.properties.title)
  const subtitle = props.hooks.useTemplate(props.properties.subtitle)
  const caption = props.hooks.useTemplate(props.properties.caption)
  const status = props.hooks.useTemplate(props.properties.status)
  const date = props.hooks.useTemplate(props.properties.date)
  const action = props.hooks.useActionTrigger(
    props.properties.action,
    item,
    props.pageSource,
  )

  const isCardStyle = React.useMemo(() => props.properties.style === 'card', [
    props.properties.style,
  ])

  const statusColor = React.useMemo(() => {
    if (status === 'failed') {
      return 'red'
    } else if (status === 'paid') {
      return 'green'
    } else if (status === 'waiting payment') {
      return 'orange'
    } else {
      return 'gray'
    }
  }, [props.properties.status])

  return (
    <ListItem
      key={itemId}
      fontSize="larger"
      p={isCardStyle ? 4 : undefined}
      bg={isCardStyle ? 'surface.900' : undefined}
      borderRadius="4px"
      borderColor={{ base: listDividerColor, md: 'none' }}
      cursor="pointer"
      onClick={action.handleClick}
    >
      <HStack spacing={3}>
        <Box flex={1} flexDirection="row" noOfLines={4} lineHeight="1.6">
          <Text
            fontSize="md"
            noOfLines={2}
            fontWeight="semibold"
            data-test="list-title"
          >
            {title}
          </Text>
          <Text
            fontSize="sm"
            color="text.700"
            noOfLines={1}
            data-test="list-desc"
          >
            {subtitle}
          </Text>
          <Text
            fontSize="sm"
            color="text.700"
            noOfLines={[1, 1, 2]}
            data-test="list-caption"
          >
            {caption}
          </Text>
        </Box>
      </HStack>
      <Divider pt="2" pb="3" color="#F5F5F5" />
      <HStack
        alignItems={'center'}
        flex={1}
        pt="3"
        justifyContent={'space-between'}
      >
        <Badge
          textColor={statusColor}
          fontWeight="nomal"
          p="1"
          pl="2"
          pr="2"
          variant={'subtle'}
          colorScheme={statusColor}
        >
          {status}
        </Badge>
        <HStack justifyContent={'flex-end'} w="65%">
          <Calender fontSize={'14px'} color="#A2A2A2" />
          <Text
            fontSize="sm"
            color="text.700"
            noOfLines={[1]}
            data-test="list-caption"
          >
            {date}
          </Text>
        </HStack>
      </HStack>
    </ListItem>
  )
}

const LoaderItem: React.FC<React.PropsWithChildren<{}>> = () => (
  <Grid templateColumns="repeat(12, 1fr)" gap={4}>
    <GridItem colSpan={12}>
      <Skeleton height="16px" width="100%" borderRadius="lg" mb={1} />
      <Stack spacing="4px">
        <Skeleton height="16px" width="50%" borderRadius="lg" />
        <Skeleton height="16px" borderRadius="lg" />
        <Skeleton height="16px" borderRadius="lg" />
        <Skeleton height="16px" borderRadius="lg" />
      </Stack>
    </GridItem>
  </Grid>
)

const StatusListComponent = registerComponent('Status Card List', {
  type: 'list',
  icon: 'ListAlt',
  group: 'list',
  defaultProps: {
    header: 'List',
    title: 'Title',
    subtitle: 'Description Text',
    caption: 'Caption',
    status: '',
    date: '',
    style: 'card',
    action: { type: 'none' },
    seeAllAction: { type: 'none' },
  },
  propDefinition: {
    header: { group: 'Design', type: 'expression', options: {} },
    title: { group: 'Design', type: 'expression', options: {} },
    subtitle: { group: 'Design', type: 'expression', options: {} },
    caption: { group: 'Design', type: 'expression', options: {} },
    status: { group: 'Design', type: 'expression', options: {} },
    date: { group: 'Design', type: 'expression', options: {} },
    style: {
      group: 'Design',
      type: 'string',
      options: {
        format: 'select',
        options: [
          {
            label: 'Card',
            value: 'card',
          },
          {
            label: 'Ghost',
            value: 'ghost',
          },
        ],
      },
    },
    action: {
      group: 'Action',
      type: 'action',
      label: 'Item Action',
      options: { type: 'none' },
    },
    seeAllAction: {
      group: 'Action',
      type: 'action',
      label: 'See All Action',
      options: { type: 'none' },
    },
  },
  Component: (props) => {
    const { rows, loading, error, revalidate } = props.data.component
    const header = props.hooks.useTemplate(props.properties.header)

    if (status === 'loading') {
      return (
        <Stack spacing="7" p={4}>
          {Array(2)
            .fill(null)
            .map((_, i) => (
              <LoaderItem key={i} />
            ))}
        </Stack>
      )
    }

    return (
      <Box>
        <Box
          h="auto"
          minHeight={header ? '10px' : '0px'}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          marginBottom={header ? '2px' : '0px'}
        >
          <Text fontWeight="bold" fontSize="md" data-test="list-header">
            {header ? header : null}
          </Text>
        </Box>
        <List spacing="12px">
          {rows?.map((item) => (
            <props.components.ListItemVariables key={item.id} variables={item}>
              <Item key={item.id} item={item} {...props} />
            </props.components.ListItemVariables>
          ))}
        </List>
      </Box>
    )
  },
})

export default StatusListComponent
