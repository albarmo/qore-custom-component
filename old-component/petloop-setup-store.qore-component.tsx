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
    name: '',
    phone: '',
    store_email: '',
    service_places_city: '',
    address: '',
    has_products: '',
    has_clinic: '',
    has_salon: '',
    courier_available: '',
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
    name: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },
    phone: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },
    store_email: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },
    service_places_city: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },
    address: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },
    has_products: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },
    has_clinic: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },
    has_salon: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },
    courier_available: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },
  },
  Component: (props) => {
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

    const name = props.hooks.useTemplate(props.properties.name)
    const phone = props.hooks.useTemplate(props.properties.phone)
    const store_email = props.hooks.useTemplate(props.properties.store_email)
    const service_places_city = props.hooks.useTemplate(
      props.properties.service_places_city,
    )
    const address = props.hooks.useTemplate(props.properties.address)
    const has_products =
      props.hooks.useTemplate(props.properties.has_products) || false
    const has_clinic =
      props.hooks.useTemplate(props.properties.has_clinic) || false
    const has_salon =
      props.hooks.useTemplate(props.properties.has_salon) || false
    const courier_available =
      props.hooks.useTemplate(props.properties.courier_available) || false

    const client = props.hooks.useClient()
    const url = 'https://staging-qore-data-teacher-593643.qore.dev'
    const headers = {
      accept: '*/*',
      'x-qore-engine-admin-secret': 'UM5MlKofJjxhC0KQejD8WZi2cmbpAN5A',
    }

    const setupStore = async () => {
      try {
        const response = await client.project.axios({
          method: 'post',
          headers,
          url: `${url}/v1/execute`,
          data: {
            operations: [
              {
                operation: 'Insert',
                instruction: {
                  table: 'Service_Place',
                  name: 'insertStore',
                  data: {
                    name: name,
                    phone: phone,
                    store_email: store_email,
                    service_places_city: service_places_city,
                    address: address,
                    has_products: has_products,
                    has_clinic: has_clinic,
                    has_salon: has_salon,
                    courier_available: courier_available,
                  },
                },
              },
              {
                operation: 'Insert',
                instruction: {
                  table: 'users',
                  name: 'insertStoreEmployee',
                  data: {
                    external_id: store_email,
                    password: 'Petloop123',
                    firstname: 'Admin',
                    lastname: name,
                    service_place_employee: '{{insertStore[0].id}}',
                    role: '4ce86cca-a979-4b64-890e-610996ccfbea',
                  },
                },
              },
            ],
          },
        })

        action.handleClick()
        return response
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
          onClick={() => setupStore()}
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
