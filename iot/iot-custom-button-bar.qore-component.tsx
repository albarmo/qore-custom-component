import React, { useCallback } from 'react'
import { Button, Flex, SimpleGrid, Skeleton } from '@chakra-ui/react'
import { registerComponent } from '@qorebase/app-cli'
import { IconHeart, IconShare, IconSave } from '@feedloop/icon'

const LoaderItem: React.FC = () => (
  <Skeleton height="18px" p="5" width="60px" borderRadius="lg" />
)

const IOTButton = registerComponent('IOT Button', {
  type: 'none',
  icon: 'IconClick',
  group: 'button',
  defaultProps: {
    type: '',
    size: 'md',
    /* Menu 1 */
    menu1Enabled: true,
    menu1LabelTrue: 'Menu One',
    menu1LabelFalse: 'Menu One',
    menu1Action: { type: 'none' },
    menu1ActionCallback: { type: 'none' },
    /* Menu 2 */
    menu2Enabled: true,
    menu2LabelTrue: 'Menu Two',
    menu2LabelFalse: 'Menu Two',
    menu2Action: { type: 'none' },
    menu2ActionCallback: { type: 'none' },
    /* Menu 3 */
    menu3Enabled: true,
    menu3LabelTrue: 'Menu Three',
    menu3LabelFalse: 'Menu Three',
    menu3Action: { type: 'none' },
    menu3ActionCallback: { type: 'none' },
    /* Menu 4 */
    menu4Enabled: true,
    menu4LabelTrue: 'Menu Four',
    menu4LabelFalse: 'Menu Four',
    menu4Action: { type: 'none' },
    menu4ActionCallback: { type: 'none' },
  },
  propDefinition: {
    type: {
      group: 'Source',
      type: 'string',
      options: {
        format: 'select',
        options: [
          { label: 'Insight', value: 'insight' },
          { label: 'Event', value: 'event' },
        ],
      },
    },
    size: {
      group: 'Design',
      type: 'string',
      options: {
        format: 'select',
        options: [
          { label: 'Large', value: 'lg' },
          { label: 'Medium', value: 'md' },
          { label: 'Small', value: 'sm' },
        ],
      },
    },
    /* Menu 1 */
    menu1Enabled: {
      group: 'Menu 1',
      type: 'boolean',
      options: { format: 'boolean' },
    },
    menu1LabelTrue: {
      group: 'Menu 1',
      type: 'expression',
      options: {},
    },
    menu1LabelFalse: {
      group: 'Menu 1',
      type: 'expression',
      options: {},
    },
    menu1Action: { group: 'Menu 1', type: 'action', options: { type: 'none' } },
    /* Menu 2 */
    menu2Enabled: {
      group: 'Menu 2',
      type: 'boolean',
      options: { format: 'boolean' },
    },
    menu2LabelTrue: {
      group: 'Menu 2',
      type: 'expression',
      options: {},
    },
    menu2LabelFalse: {
      group: 'Menu 2',
      type: 'expression',
      options: {},
    },
    menu2Action: { group: 'Menu 2', type: 'action', options: { type: 'none' } },
    /* Menu 3 */
    menu3Enabled: {
      group: 'Menu 3',
      type: 'boolean',
      options: { format: 'boolean' },
    },
    menu3LabelTrue: {
      group: 'Menu 3',
      type: 'expression',
      options: {},
    },
    menu3LabelFalse: {
      group: 'Menu 3',
      type: 'expression',
      options: {},
    },
    menu3Action: { group: 'Menu 3', type: 'action', options: { type: 'none' } },
    /* Menu 4 */
    menu4Enabled: {
      group: 'Menu 4',
      type: 'boolean',
      options: { format: 'boolean' },
    },
    menu4LabelTrue: {
      group: 'Menu 4',
      type: 'expression',
      options: {},
    },
    menu4LabelFalse: {
      group: 'Menu 4',
      type: 'expression',
      options: {},
    },
    menu4Action: { group: 'Menu 4', type: 'action', options: { type: 'none' } },
    /* Callbacks Actions */
    menu1ActionCallback: {
      group: 'Callback',
      type: 'action',
      options: { type: 'none' },
    },
    menu2ActionCallback: {
      group: 'Callback',
      type: 'action',
      options: { type: 'none' },
    },
    menu3ActionCallback: {
      group: 'Callback',
      type: 'action',
      options: { type: 'none' },
    },
    menu4ActionCallback: {
      group: 'Callback',
      type: 'action',
      options: { type: 'none' },
    },
  },
  Component: (props) => {
    const client = props.hooks.useClient()
    const sourceType: string = props.hooks.useTemplate(props.properties.type)
    const user_id: number = +props.data.user.user?.id
    const source_id: number =
      // @ts-ignore
      +props.pageSource.rowId || +props.pageSource.defaultRow.rowId

    const size = props.hooks.useTemplate(props.properties.size)
    const icons = [<IconHeart />, <IconSave />, <IconShare />]
    const [value] = React.useState('Hello world')

    let menus = [
      {
        labelTrue: props.hooks.useTemplate(props.properties.menu1LabelTrue),
        labelFalse: props.hooks.useTemplate(props.properties.menu1LabelFalse),
        action: props.hooks.useActionTrigger(
          props.properties.menu1Action,
          props.data.page.row,
          props.pageSource,
        ),
        callback_action: props.hooks.useActionTrigger(
          props.properties.menu1ActionCallback,
          props.data.page.row,
          props.pageSource,
        ),

        enabled: props.properties.menu1Enabled,
      },
      {
        labelTrue: props.hooks.useTemplate(props.properties.menu2LabelTrue),
        labelFalse: props.hooks.useTemplate(props.properties.menu2LabelFalse),
        action: props.hooks.useActionTrigger(
          props.properties.menu2Action,
          props.data.page.row,
          props.pageSource,
        ),
        callback_action: props.hooks.useActionTrigger(
          props.properties.menu2ActionCallback,
          props.data.page.row,
          props.pageSource,
        ),
        enabled: props.properties.menu2Enabled,
      },
      {
        labelTrue: props.hooks.useTemplate(props.properties.menu3LabelTrue),
        labelFalse: props.hooks.useTemplate(props.properties.menu3LabelFalse),
        action: props.hooks.useActionTrigger(
          props.properties.menu3Action,
          props.data.page.row,
          props.pageSource,
        ),
        callback_action: props.hooks.useActionTrigger(
          props.properties.menu3ActionCallback,
          props.data.page.row,
          props.pageSource,
        ),
        enabled: props.properties.menu3Enabled,
      },
      {
        labelTrue: props.hooks.useTemplate(props.properties.menu4LabelTrue),
        labelFalse: props.hooks.useTemplate(props.properties.menu4LabelFalse),
        action: props.hooks.useActionTrigger(
          props.properties.menu4Action,
          props.data.page.row,
          props.pageSource,
        ),
        callback_action: props.hooks.useActionTrigger(
          props.properties.menu4ActionCallback,
          props.data.page.row,
          props.pageSource,
        ),
        enabled: props.properties.menu4Enabled,
      },
    ]
    const [status, setStatus] = React.useState([])

    const getData = async (target_name, params) => {
      if (!target_name || !params) return
      const baseUrl = 'https://staging-qore-data-coat-529649.qore.dev'
      const headers = {
        accept: 'application/json',
        'x-qore-engine-admin-secret': 'qI1LSVkTcUQP5f4kDpoIvlG70u90OuyD',
        'Content-Type': 'application/json',
      }
      const response = await client.project.axios({
        method: 'POST',
        url: `${baseUrl}/v1/execute`,
        headers,
        data: {
          operations: [
            {
              operation: 'Select',
              instruction: {
                view: target_name,
                name: 'data',
                limit: 1,
                offset: 0,
                orderBy: {
                  id: 'ASC',
                },
                params: { ...params },
              },
            },
          ],
        },
      })
      return response?.data?.results?.data
    }

    React.useEffect(() => {
      if (!user_id || !source_id) return
      ;(async () => {
        const userRegistered = await getData(
          'event_participant_by_user_and_event',
          {
            user_id: user_id,
            event_id: source_id,
          },
        )
        const userLog = await getData('user_history_by_insight', {
          type: 'like',
          user_id: user_id,
          insight_id: source_id,
        })
        const userBookmark = await getData('bookmark_by_insight_and_user', {
          user_id: user_id,
          insight_id: source_id,
        })

        const isRegistered = !!userRegistered.length
        const isLiked = !!userLog.length
        const isBookmarked = !!userBookmark.length

        setStatus([
          {
            id: 1,
            status: sourceType == 'event' ? isRegistered : false,
            loading: false,
          },
          {
            id: 2,
            status: isLiked,
            loading: false,
          },
          {
            id: 3,
            status: isBookmarked,
            loading: false,
          },
          {
            id: 4,
            status: false,
            loading: false,
          },
        ])
      })()
    }, [user_id, source_id])

    const redirectToDownload = (file_url) => {
      window.open(file_url, '_blank')
    }

    const handleClickMenu = useCallback(
      async (index, menu, menu_status) => {
        if (index == 0 && sourceType == 'insight') {
          redirectToDownload(props.data.page.row?.file_data)
        }

        let statusList = [...status]
        statusList[index] = {
          id: menu.id,
          status: !statusList[index].status,
          loading: true,
        }
        setStatus([...statusList])

        if (!menu_status) {
          // main action
          await menus[index].action.handleClick()
        } else {
          //callback action
          await menus[index].callback_action.handleClick()
        }

        statusList[index] = {
          id: menu.id,
          status: statusList[index].status,
          loading: false,
        }
        setStatus([...statusList])
      },
      [status, setStatus],
    )

    if (!status || !source_id || !user_id) {
      return (
        <SimpleGrid bg={'white'} p="4" columns={[1, 1, 1, 2]} spacing="20px">
          <Skeleton height="18px" p="5" width="full" borderRadius="lg" />
          <Flex
            display="flex"
            justifyContent={['space-around', 'space-around', , 'flex-end']}
            gap="5"
          >
            {Array(3)
              .fill(null)
              .map(() => (
                <LoaderItem />
              ))}
          </Flex>
        </SimpleGrid>
      )
    }

    return (
      <>
        {!!status?.length && (
          <SimpleGrid bg={'white'} p="4" columns={[1, 1, 1, 1]} spacing="20px">
            <Button
              isDisabled={sourceType == 'event' && status[0]?.status}
              display={menus[0]?.enabled ? 'flex' : 'none'}
              bg="#EE672B"
              size={size}
              isLoading={status[0]?.loading}
              loadingText={'processing..'}
              _focus={{ boxShadow: 'none' }}
              _hover={{ background: 'gray.100', color: '#EE672B' }}
              onClick={() => handleClickMenu(0, menus[0], status[0]?.status)}
            >
              {status[0]?.status ? menus[0].labelFalse : menus[0].labelTrue}
            </Button>
            <Flex
              display="flex"
              justifyContent={['space-around', 'space-around', , 'flex-end']}
              gap="5"
              p="3"
            >
              {menus?.map(
                (menu, index) =>
                  menu.enabled && (
                    <Flex
                      display={index == 0 && 'none'}
                      direction="column"
                      alignItems="center"
                      bg="#FFFFFF"
                      cursor="pointer"
                      rounded="md"
                    >
                      <Button
                        size={size}
                        _focus={{ boxShadow: 'none' }}
                        _hover={{ background: 'none', color: '#EE672B' }}
                        leftIcon={icons[index - 1]}
                        isLoading={status[index]?.loading}
                        color={status[index]?.status && index != 3 && '#EE672B'}
                        variant="link"
                        onClick={() =>
                          handleClickMenu(index, menu, status[index]?.status)
                        }
                      >
                        {status[index].status
                          ? menu.labelFalse
                          : menu.labelTrue}
                      </Button>
                    </Flex>
                  ),
              )}
            </Flex>
          </SimpleGrid>
        )}
      </>
    )
  },
})

export default IOTButton
