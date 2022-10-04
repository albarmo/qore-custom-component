import { Box, Button } from '@chakra-ui/react'
import { registerComponent } from '@qorebase/app-cli'
import React from 'react'

export default registerComponent('Button Setup Store', {
  type: 'none',
  icon: 'IconClick',
  group: 'button',
  defaultProps: {
    label: 'Button',
    size: 'md',
    style: 'solid',
    action: { type: 'none' },
    hidden: '',
    disabled: '',
    storeId: '',
  },
  propDefinition: {
    label: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
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
    style: {
      group: 'Design',
      type: 'string',
      options: {
        format: 'select',
        options: [
          { label: 'Primary', value: 'solid' },
          { label: 'Secondary', value: 'ghost' },
        ],
      },
    },
    action: { group: 'Action', type: 'action', options: { type: 'none' } },
    disabled: {
      group: 'Visibility',
      type: 'string',
      options: { format: 'text' },
    },
    hidden: {
      group: 'Visibility',
      type: 'string',
      options: { format: 'text' },
    },
    storeId: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },
  },
  Component: (props) => {
    const client = props.hooks.useClient()
    const store_id = props.hooks.useTemplate(props.properties.storeId)
    const disabled = props.hooks.useTemplate(props.properties.disabled)
    const isDisabled = React.useMemo(() => {
      try {
        return !!JSON.parse(disabled)
      } catch (error) {
        return false
      }
    }, [disabled])
    const hidden = props.hooks.useTemplate(props.properties.hidden)
    const isHidden = React.useMemo(() => {
      try {
        return !!JSON.parse(hidden)
      } catch (error) {
        return false
      }
    }, [hidden])
    const action = props.hooks.useActionTrigger(
      props.properties.action,
      props.data.page.row,
      props.pageSource,
    )

    const buttonLabel = props.hooks.useTemplate(props.properties.label)
    if (isHidden) return null

    async function generateSlot(store_id) {
      if (!store_id) return
      try {
        const { data } = await client.project.axios({
          method: 'post',
          url:
            'https://staging-qore-pipeline-teacher-593643.qore.dev/api/workflow/12abe903-7193-42d7-88b7-db587eac3f57/instance/dbce411e-c9bf-4c37-a668-69cb0bb4f3d9/inbound',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:101.0) Gecko/20100101 Firefox/101.0',
            Accept: 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Content-Type': 'application/json',
            'x-qonduit-admin-secret': '6IAapEo0ju9GEzuxIqwAdrS0q8kD8fOw',
            Origin: 'https://staging-qore-pipeline-teacher-593643.qore.dev',
            Connection: 'keep-alive',
            Referer:
              'https://staging-qore-pipeline-teacher-593643.qore.dev/workflows/12abe903-7193-42d7-88b7-db587eac3f57',
            Cookie: 'qonduit-admin-secret=6IAapEo0ju9GEzuxIqwAdrS0q8kD8fOw',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            TE: 'trailers',
          },
          data: {
            storeId: +store_id,
          },
        })
        return data
      } catch (error) {
        throw new Error(error)
      }
    }

    return (
      <Box padding="8px">
        <Button
          display={{ base: 'initial', md: 'none' }}
          width="full"
          size={props.properties.size}
          onClick={() => generateSlot(store_id)}
          disabled={action.loading || isDisabled}
          variant={props.properties.style}
          isLoading={action.loading}
          loadingText="Loading..."
          colorScheme="blue"
          spinner={null}
        >
          {buttonLabel}
        </Button>
      </Box>
    )
  },
})
