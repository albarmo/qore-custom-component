import {
  Image,
  Box,
  HStack,
  List,
  ListItem,
  Text,
  AspectRatio,
  useColorMode,
  Icon,
  Skeleton,
  useColorModeValue,
  Grid,
  GridItem,
  Stack,
  Center,
} from '@chakra-ui/react'
import { IconSave, IconShare } from '@feedloop/icon'
import { registerComponent, Row } from '@qorebase/app-cli'
import React from 'react'

const Item = (
  props: {
    item: Row
  } & typeof InsightListCard['component']['Component']['defaultProps'],
) => {
  const { item } = props
  const itemId = props.hooks.useTemplate(item.id || props.source.itemId)
  const { colorMode } = useColorMode()
  const listDividerColor = useColorModeValue('gray.200', 'gray.600')
  const color = useColorModeValue('blackAlpha.700', 'whiteAlpha.700')

  const thumbOnLeft = props.properties.position === 'left'
  const tags = props.hooks.useTemplate(props.properties.tags)
  const title = props.hooks.useTemplate(props.properties.title)
  const thumbnail = props.hooks.useTemplate(props.properties.source)
  const thumbsSpace = props.hooks.useTemplate(props.properties.shape)
  const image_size = props.hooks.useTemplate(props.properties.image_size)
  const subtitle = props.hooks.useTemplate(props.properties.subtitle)
  const caption = props.hooks.useTemplate(props.properties.caption)
  const action = props.hooks.useActionTrigger(
    props.properties.action,
    item,
    props.pageSource,
  )
  const has_additional_action = props.hooks.useTemplate(
    props.properties.has_additional_action,
  )
  const action_one = props.hooks.useActionTrigger(
    props.properties.action_one,
    item,
    props.pageSource,
  )

  const action_two = props.hooks.useActionTrigger(
    props.properties.action_two,
    item,
    props.pageSource,
  )

  const thumb = (
    <AspectRatio
      width={image_size ? image_size : ['74px', '84px', '94px']}
      ratio={thumbsSpace == 'full' ? 1 : 3 / 4}
      onClick={action.handleClick}
      cursor="pointer"
    >
      <Image
        alt={title}
        src={thumbnail}
        bg="gray.200"
        data-test="list-thumb"
        rounded={thumbsSpace}
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
      return 1
    } else if (title.length >= 90) {
      return 1
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
      boxShadow="rgba(149, 157, 165, 0.2) 0px 8px 24px;"
      overflow="hidden"
    >
      <HStack spacing={3}>
        <Box>
          {thumbnail && thumbOnLeft && thumb}
          {has_additional_action == 'true' && thumbOnLeft && (
            <HStack justify="space-around" padding="2">
              <Icon
                boxSize={4}
                color={color}
                as={IconSave}
                onClick={action_one.handleClick}
                cursor="pointer"
              />
              <Icon
                boxSize={4}
                color={color}
                as={IconShare}
                onClick={action_two.handleClick}
                cursor="pointer"
              />
            </HStack>
          )}
        </Box>
        <Box flex={1} flexDirection="row" p="0">
          <Text
            fontSize="10px"
            noOfLines={[1]}
            color="var(--chakra-colors-qore-primary)"
            fontWeight="semibold"
            data-test="list-title"
            mb="1"
          >
            {tags}
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
        </Box>
        <Box>
          {thumbnail && !thumbOnLeft && thumb}
          {has_additional_action == 'true' && !thumbOnLeft && (
            <HStack justify="space-around" padding="2">
              <Icon
                boxSize={4}
                color={color}
                as={IconSave}
                onClick={action_one.handleClick}
                cursor="pointer"
              />
              <Icon
                boxSize={4}
                color={color}
                as={IconShare}
                onClick={action_two.handleClick}
                cursor="pointer"
              />
            </HStack>
          )}
        </Box>
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

const InsightListCard = registerComponent('Insight List Card', {
  type: 'list',
  icon: 'IconListUl',
  group: 'list',
  defaultProps: {
    tags: '',
    title: 'Title',
    subtitle: 'Description Text',
    caption: 'Caption',
    source: 'https://via.placeholder.com/150',
    image_size: 'contain',
    position: 'right',
    shape: 'lg',
    has_additional_action: 'true',
    action: { type: 'none' },
    action_one: { type: 'none' },
    action_two: { type: 'none' },
    seeAllAction: { type: 'none' },
  },
  propDefinition: {
    tags: { group: 'Design', type: 'expression', options: {} },
    title: { group: 'Design', type: 'expression', options: {} },
    subtitle: { group: 'Design', type: 'expression', options: {} },
    caption: { group: 'Design', type: 'expression', options: {} },
    source: { group: 'Thumbnail', type: 'expression', options: {} },
    image_size: { group: 'Thumbnail', type: 'expression', options: {} },
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
    has_additional_action: {
      group: 'Design',
      type: 'string',
      options: {
        format: 'select',
        options: [
          {
            label: 'Yes',
            value: 'true',
          },
          {
            label: 'No',
            value: 'false',
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
    action_one: {
      group: 'Action',
      type: 'action',
      label: 'Item Action',
      options: { type: 'none' },
    },
    action_two: {
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
            .map(() => (
              <LoaderItem hasThumbnail={Boolean(props.properties.source)} />
            ))}
        </Stack>
      )
    }

    return (
      <Box p="4" bg="#ffff">
        <Box
          h="auto"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
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

export default InsightListCard
