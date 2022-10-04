import {
  Skeleton,
  Tag,
  TagLabel,
  SimpleGrid,
  Box,
  Text,
} from '@chakra-ui/react'
import React from 'react'
import { registerComponent, Row } from '@qorebase/app-cli'

interface Tag {
  id: number | string
  created_at: Date
  updated_at: Date
  title: string | null
  view_count: number
}

const Item = (
  props: {
    item: Row
  } & typeof TagList['component']['Component']['defaultProps'],
) => {
  const { item } = props
  const action = props.hooks.useActionTrigger(
    props.properties.action,
    item,
    props.pageSource,
  )
  return (
    <Tag
      size={'md'}
      marginRight="2"
      marginBottom="2"
      key={item.id}
      variant="outline"
      colorScheme="orange"
      cursor="pointer"
      onClick={action.handleClick}
    >
      <TagLabel>{item?.title}</TagLabel>
    </Tag>
  )
}

const LoaderItem: React.FC = () => (
  <Skeleton height="18px" width="60px" borderRadius="lg" />
)

const TagList = registerComponent('Tags', {
  type: 'list',
  icon: 'IconListUl',
  group: 'list',
  defaultProps: {
    title: 'Title',
    action: { type: 'none' },
  },
  propDefinition: {
    title: { group: 'Design', type: 'expression', options: {} },
    action: {
      group: 'Action',
      type: 'action',
      label: 'Item Action',
      options: { type: 'none' },
    },
  },
  Component: (props) => {
    const title = props.hooks.useTemplate(props.properties.title)
    const client = props.hooks.useClient()
    const sourceName = props?.source.target
    const source_id =
      //@ts-ignore
      props.pageSource.rowId || props.pageSource.defaultRow.rowId

    const [sourceData, setSourceData] = React.useState<any[]>()
    const [tagList, setTagList] = React.useState<Tag[]>()

    React.useMemo(async () => {
      if (!source_id || !sourceName) return
      const baseUrl = 'https://staging-qore-data-coat-529649.qore.dev'
      const headers = {
        accept: 'application/json',
        'x-qore-engine-admin-secret': 'qI1LSVkTcUQP5f4kDpoIvlG70u90OuyD',
        'Content-Type': 'application/json',
      }
      try {
        const response = await client.project.axios({
          method: 'GET',
          headers,
          url: `${baseUrl}/v1/table/${sourceName}/row/${source_id}`,
        })
        setSourceData(response.data)
        return response
      } catch (error) {
        return error
      }
    }, [source_id, sourceName])

    //@ts-ignore
    React.useMemo(async () => {
      const url = 'https://staging-qore-data-coat-529649.qore.dev'
      const headers = {
        accept: 'application/json',
        'x-qore-engine-admin-secret': 'qI1LSVkTcUQP5f4kDpoIvlG70u90OuyD',
        'Content-Type': 'application/json',
      }
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
                  table: 'tags',
                  name: 'data',
                },
              },
            ],
          },
        })
        setTagList(response.data.results.data as Tag[])
        return response.data.results.data
      } catch (error) {
        return error
      }
    }, [])

    const tags = React.useMemo(() => {
      if (!sourceData || !tagList) return
      //@ts-ignore
      const keywordMapped: string[] = sourceData?.single_tag
        .replace(/\s/g, '')
        .split(',')
      //@ts-ignore
      const data = tagList?.filter((item) =>
        keywordMapped?.includes(item.title),
      )
      return data
    }, [sourceData, tagList])

    if (!tags && !source_id) {
      return (
        <SimpleGrid minChildWidth="60px" spacing="10px" display="flex">
          {Array(5)
            .fill(null)
            .map(() => (
              <LoaderItem />
            ))}
        </SimpleGrid>
      )
    }

    return (
      <Box
        display={!tags?.length ? 'none' : 'block'}
        padding={5}
        background="white"
      >
        {title && (
          <Text fontSize="lg" pb={2}>
            {title}
          </Text>
        )}
        <SimpleGrid minChildWidth="60px" spacing="20px" display="auto">
          {!props.source.target ? (
            <Item item={props.data.page.row} {...props} />
          ) : (
            tags?.map((item) => (
              <props.components.ListItemVariables
                key={item.id}
                variables={item}
              >
                <Item key={item.id} item={item} {...props} />
              </props.components.ListItemVariables>
            ))
          )}
        </SimpleGrid>
      </Box>
    )
  },
})

export default TagList
