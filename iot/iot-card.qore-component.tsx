import {
  Image,
  Box,
  HStack,
  List,
  ListItem,
  Text,
  AspectRatio,
  useColorMode,
  Skeleton,
  useColorModeValue,
  Grid,
  GridItem,
  Stack,
  Center,
} from '@chakra-ui/react'
import { registerComponent, Row } from '@qorebase/app-cli'
import React from 'react'

const Item = (
  props: {
    item: Row
  } & typeof IOTListComponent['component']['Component']['defaultProps'],
) => {
  const { item } = props
  const itemId = props.hooks.useTemplate(item.id || props.source.itemId)
  const { colorMode } = useColorMode()
  const listDividerColor = useColorModeValue('gray.200', 'gray.600')
  const thumbOnLeft = props.properties.position === 'left'
  const tag = props.hooks.useTemplate(props.properties.tag)
  const title = props.hooks.useTemplate(props.properties.title)
  const thumbnail = props.hooks.useTemplate(props.properties.source)
  const thumbsSpace = props.hooks.useTemplate(props.properties.shape)
  const subtitle = props.hooks.useTemplate(props.properties.subtitle)
  const caption = props.hooks.useTemplate(props.properties.caption)
  const is_gold = props.hooks.useTemplate(props.properties.is_gold)
  const action = props.hooks.useActionTrigger(
    props.properties.action,
    item,
    props.pageSource,
  )

  const thumb = (
    <AspectRatio ratio={1} width="80px">
      <Image
        alt={title}
        src={thumbnail}
        bg="gray.200"
        rounded={thumbsSpace}
        data-test="list-thumb"
      />
    </AspectRatio>
  )

  const turncateDescriptionLines = React.useMemo(() => {
    if (!title) return 3

    if (title.length <= 30) {
      return 3
    } else if (title.length > 30 && title.length <= 60) {
      return 2
    } else if (title.length > 60 && title.length < 90) {
      return 2
    } else if (title.length >= 90) {
      return 2
    }
  }, [title])

  return (
    <ListItem
      h={'auto'}
      key={itemId}
      fontSize="larger"
      p="3"
      pl="2"
      bg={'#ffffff'}
      borderRadius="1px"
      borderColor={{ base: listDividerColor, md: 'none' }}
      borderLeft={is_gold == 'true' && '1.5px solid'}
      borderLeftColor={is_gold == 'true' && 'var(--chakra-colors-qore-primary)'}
      boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px;"
      overflow="hidden"
    >
      <HStack spacing={3}>
        <Box>{thumbnail && thumbOnLeft && thumb}</Box>
        <Box flex={1} flexDirection="row" p="0">
          <Text
            fontSize="10px"
            noOfLines={[1]}
            color="var(--chakra-colors-qore-primary)"
            fontWeight="semibold"
            data-test="list-title"
            mb="1"
          >
            {tag}
          </Text>
          <Text
            fontSize={['12px', '12px', '14px', '14px']}
            noOfLines={[3, 4]}
            fontWeight="bold"
            data-test="list-title"
            onClick={action.handleClick}
            cursor="pointer"
          >
            {title}
          </Text>
          <Text
            mt="1"
            fontSize={['10px', '10px', 'xs']}
            color={colorMode === 'light' ? 'gray.500' : 'gray.400'}
            noOfLines={turncateDescriptionLines}
            data-test="list-desc"
            onClick={action.handleClick}
            cursor="pointer"
          >
            {subtitle}
          </Text>
          <Text
            fontSize="10px"
            color={colorMode === 'light' ? 'gray.400' : 'gray.300'}
            noOfLines={[1]}
            data-test="list-caption"
            mt="3"
          >
            {caption}
          </Text>
          {is_gold == 'true' && (
            <Text
              fontSize="10px"
              noOfLines={[1]}
              color="var(--chakra-colors-qore-primary)"
              fontWeight="bold"
              data-test="list-title"
              mt="2"
            >
              GOLD INSIGHT
            </Text>
          )}
        </Box>
        <Box>{thumbnail && !thumbOnLeft && thumb}</Box>
      </HStack>
    </ListItem>
  )
}

const LoaderItem: React.FC<{ hasThumbnail: boolean }> = ({ hasThumbnail }) => (
  <Grid templateColumns="repeat(12, 1fr)" gap={4}>
    <GridItem colSpan={hasThumbnail ? 9 : 12}>
      <Skeleton height="16px" width="100%" borderRadius="lg" mb={1} />
      <Stack spacing="4px">
        <Skeleton height="16px" width="50%" borderRadius="lg" />
        <Skeleton height="16px" borderRadius="lg" />
        <Skeleton height="16px" borderRadius="lg" />
        <Skeleton height="16px" borderRadius="lg" />
      </Stack>
    </GridItem>
    {hasThumbnail && (
      <GridItem colSpan={3}>
        <Center w="100%" h="100%">
          <Skeleton boxSize="64px" borderRadius="lg" />
        </Center>
      </GridItem>
    )}
  </Grid>
)

const IOTListComponent = registerComponent('IOT Card List', {
  type: 'list',
  icon: 'IconListUl',
  group: 'list',
  defaultProps: {
    header: 'List',
    tag: '',
    title: 'Title',
    subtitle: 'Description Text',
    caption: 'Caption',
    is_gold: '',
    source: 'https://via.placeholder.com/150',
    position: 'right',
    shape: 'lg',
    action: { type: 'none' },
    seeAllAction: { type: 'none' },
  },
  propDefinition: {
    header: { group: 'Design', type: 'expression', options: {} },
    tag: { group: 'Design', type: 'expression', options: {} },
    title: { group: 'Design', type: 'expression', options: {} },
    subtitle: { group: 'Design', type: 'expression', options: {} },
    caption: { group: 'Design', type: 'expression', options: {} },
    is_gold: { group: 'Design', type: 'expression', options: {} },
    source: { group: 'Thumbnail', type: 'expression', options: {} },
    position: {
      group: 'Thumbnail',
      type: 'string',
      options: {
        format: 'select',
        options: [
          {
            label: 'Left',
            value: 'left',
          },
          {
            label: 'Right',
            value: 'right',
          },
        ],
      },
    },
    shape: {
      group: 'Thumbnail',
      type: 'string',
      options: {
        format: 'select',
        options: [
          {
            label: 'Square',
            value: 'none',
          },
          {
            label: 'Rounded',
            value: 'lg',
          },
          {
            label: 'Circle',
            value: 'full',
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
    const header = props.hooks.useTemplate(props.properties.header)
    const seeAllAction = props.hooks.useActionTrigger(
      props.properties.seeAllAction,
      props.data.page.row,
      props.pageSource,
    )

    if (!props.data.component.rows) {
      return (
        <Stack spacing="7" p={4}>
          {Array(2)
            .fill(null)
            .map((el, index) => (
              <LoaderItem
                key={index}
                hasThumbnail={Boolean(props.properties.source)}
              />
            ))}
        </Stack>
      )
    }

    return (
      <Box p="4" bg="white">
        <Box
          h="auto"
          minHeight={header ? '10px' : '0px'}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          marginBottom={header ? '4px' : '0px'}
        >
          <Text fontWeight="bold" fontSize="md" data-test="list-header">
            {header ? header : null}
          </Text>
          {props.properties.seeAllAction.type !== 'none' && (
            <Text
              cursor="pointer"
              color={'var(--chakra-colors-qore-primary)'}
              fontSize="md"
              onClick={seeAllAction.handleClick}
              align="right"
              justifyItems="flex-end"
              data-test="list-see-all"
            >
              See All
            </Text>
          )}
        </Box>
        <List spacing="12px">
          {!props.source.target ? (
            <Item item={props.data.page.row} {...props} />
          ) : (
            props.data.component.rows?.map((item) => (
              <props.components.ListItemVariables
                key={item.id}
                variables={item}
              >
                <Item key={item.id} item={item} {...props} />
              </props.components.ListItemVariables>
            ))
          )}
        </List>
      </Box>
    )
  },
})

export default IOTListComponent
