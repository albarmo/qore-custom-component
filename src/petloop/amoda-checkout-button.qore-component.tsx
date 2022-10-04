import { registerComponent } from '@qorebase/app-cli'
import { Box, Button } from '@chakra-ui/react'

const CheckoutButton = registerComponent('Procced to Payment Button', {
  type: 'none',
  icon: 'IconX',
  group: 'button',
  defaultProps: {
    label: '',
    invoice_url: '',
  },
  propDefinition: {
    label: {
      type: 'string',
      options: {
        format: 'text',
      },
    },
    invoice_url: {
      type: 'string',
      options: {
        format: 'text',
      },
    },
  },
  Component: (props) => {
    const label = props.hooks.useTemplate(props.properties.label)
    const invoiceUrl = props.hooks.useTemplate(props.properties.invoice_url)

    const redirectToPayment = async () => {
      window.location.replace(invoiceUrl)
    }

    return (
      <Box padding="4px" pt="0" mt="0" h="min-content">
        <Box p={1} pt={4} pb={4}>
          <Button
            width="full"
            colorScheme="blue"
            onClick={redirectToPayment}
            loadingText="Loading..."
          >
            {label}
          </Button>
        </Box>
      </Box>
    )
  },
})

export default CheckoutButton
