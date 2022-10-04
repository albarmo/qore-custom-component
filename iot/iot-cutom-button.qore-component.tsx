import { Box, Button } from '@chakra-ui/react'
import { registerComponent } from '@qorebase/app-cli'
import React from 'react'

const IOTButton = registerComponent('IOT Button', {
  type: 'list',
  icon: 'IconClick',
  group: 'button',
  defaultProps: {
    title_true: 'Save',
    title_false: 'Saved',
    size: 'md',
    action: { type: 'none' },
    action_two: { type: 'none' },
  },
  propDefinition: {
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
    action: {
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
  },
  Component: (props) => {
    const data = props.data.component.rows
    const source_id =
      // @ts-ignore
      props.pageSource.rowId || props.pageSource.defaultRow.rowId

    const title_true = props.hooks.useTemplate(props.properties.title_true)
    const title_false = props.hooks.useTemplate(props.properties.title_false)
    const action = props.hooks.useActionTrigger(
      props.properties.action,
      props.data.page.row,
      props.pageSource,
    )
    const action_two = props.hooks.useActionTrigger(
      props.properties.action_two,
      props.data.page.row,
      props.pageSource,
    )

    const [status, setStatus] = React.useState<boolean | null>(null)
    const [loading, setLoading] = React.useState<boolean>(false)

    React.useEffect(() => {
      if (!data || !source_id) return
      setStatus(data.length > 0 ? true : false)
    }, [data, source_id])

    const handleClickOne = async () => {
      setLoading(true)
      await action.handleClick()
      setStatus(true)
      setLoading(false)
    }
    const handleClickTwo = async () => {
      setLoading(true)
      await action_two.handleClick()
      setStatus(false)
      setLoading(false)
    }

    return (
      <Box p="4" visibility={status == null ? 'hidden' : 'visible'}>
        {!status ? (
          <Button
            size={props.properties.size}
            _focus={{ boxShadow: 'none' }}
            bg="#EE672B"
            _hover={{ background: 'gray.100', color: '#EE672B' }}
            colorScheme="orange"
            onClick={() => handleClickOne()}
            isLoading={loading}
            loadingText={title_false}
          >
            {title_false}
          </Button>
        ) : (
          <Button
            size={props.properties.size}
            _focus={{ boxShadow: 'none' }}
            bg="#EE672B"
            _hover={{ background: 'gray.100', color: '#EE672B' }}
            colorScheme="orange"
            onClick={() => handleClickTwo()}
            isLoading={loading}
            loadingText={title_true}
          >
            {title_true}
          </Button>
        )}
      </Box>
    )
  },
})

export default IOTButton
