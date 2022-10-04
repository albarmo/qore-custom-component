import { Box, Button } from '@chakra-ui/react'
import React from 'react'
import { registerComponent } from '@qorebase/app-cli'

const IOTButton = registerComponent('Register Button', {
  type: 'list',
  icon: 'IconClick',
  group: 'button',
  defaultProps: {
    price: '',
    type_of_event: 'webminar',
    title_true: 'Save',
    title_false: 'Saved',
    size: 'md',
    action_paid: { type: 'none' },
    action_free: { type: 'none' },
    action_registered: { type: 'none' },
  },
  propDefinition: {
    price: { group: 'Design', type: 'expression', options: {} },
    type_of_event: { group: 'Design', type: 'expression', options: {} },
    title_true: { group: 'Design', type: 'expression', options: {} },
    title_false: { group: 'Design', type: 'expression', options: {} },
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
    action_paid: {
      group: 'Action',
      type: 'action',
      options: { type: 'none' },
    },
    action_free: {
      group: 'Action',
      type: 'action',
      options: { type: 'none' },
    },
    action_registered: {
      group: 'Action',
      type: 'action',
      options: { type: 'none' },
    },
  },
  Component: (props) => {
    const data = props.data.component.rows
    const source_id =
      // @ts-ignore
      props.pageSource.rowId || props.pageSource.defaultRow.rowId
    const typeOfEvent = props.hooks.useTemplate(props.properties.type_of_event)
    const price = props.hooks.useTemplate(props.properties.price)
    const title_true = props.hooks.useTemplate(props.properties.title_true)
    const title_false = props.hooks.useTemplate(props.properties.title_false)
    const action_paid = props.hooks.useActionTrigger(
      props.properties.action_paid,
      props.data.page.row,
      props.pageSource,
    )
    const action_free = props.hooks.useActionTrigger(
      props.properties.action_free,
      props.data.page.row,
      props.pageSource,
    )
    const action_registered = props.hooks.useActionTrigger(
      props.properties.action_registered,
      props.data.page.row,
      props.pageSource,
    )

    const [isFree, setIsFree] = React.useState<boolean | null>(null)
    const [status, setStatus] = React.useState<boolean | null>(null)
    const [loading, setLoading] = React.useState<boolean>(false)

    React.useEffect(() => {
      if (!data || !source_id || !price) return
      setStatus(data.length > 0 ? true : false)
      setIsFree(+price > 0 ? false : true)
    }, [data, source_id, price])

    const handleClickPaid = async () => {
      setLoading(true)
      await action_paid.handleClick()
      setStatus(true)
      setLoading(false)
    }

    const handleClickFree = async () => {
      setLoading(true)
      await action_free.handleClick()
      setStatus(false)
      setLoading(false)
    }

    return (
      <Box p="4" bg="white" visibility={status == null ? 'hidden' : 'visible'}>
        {status ? (
          <Button
            w="full"
            size={props.properties.size}
            _focus={{ boxShadow: 'none' }}
            bg="#EE672B"
            _hover={{ background: 'gray.100', color: '#EE672B' }}
            colorScheme="orange"
            onClick={() => {
              action_registered.handleClick()
            }}
            isLoading={loading}
            loadingText={'loading...'}
          >
            {title_true}
          </Button>
        ) : (
          <Button
            w="full"
            size={props.properties.size}
            _focus={{ boxShadow: 'none' }}
            bg="#EE672B"
            _hover={{ background: 'gray.100', color: '#EE672B' }}
            colorScheme="orange"
            onClick={() => {
              isFree ? handleClickFree() : handleClickPaid()
            }}
            isLoading={loading}
            loadingText={'loading...'}
          >
            {title_false}
          </Button>
        )}
      </Box>
    )
  },
})

export default IOTButton
