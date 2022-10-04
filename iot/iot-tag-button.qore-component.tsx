import React from 'react'
import { registerComponent } from '@qorebase/app-cli'
import { Box, Tag, TagLabel } from '@chakra-ui/react'

export default registerComponent('Tag Button', {
  type: 'none',
  icon: 'ButtonAlt',
  group: 'button',
  defaultProps: {
    label: 'Button',
    size: 'md',
    style: 'solid',
    action: { type: 'none' },
    hidden: '',
    disabled: '',
  },
  propDefinition: {
    label: {
      group: 'Design',
      type: 'expression',
      options: {},
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
          { label: 'Solid', value: 'solid' },
          { label: 'Subtle', value: 'subtle' },
          { label: 'Outline', value: 'outline' },
        ],
      },
    },
    action: { group: 'Action', type: 'action', options: { type: 'none' } },
    disabled: {
      group: 'Visibility',
      type: 'expression',
      options: {},
    },
    hidden: {
      group: 'Visibility',
      type: 'expression',
      options: {},
    },
  },
  Component: (props) => {
    const size = props.hooks.useTemplate(props.properties.size)
    const style = props.hooks.useTemplate(props.properties.style)
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

    return (
      <Box backgroundColor="white" padding={4}>
        <Tag
          size={size}
          variant={style}
          colorScheme="orange"
          cursor="pointer"
          onClick={action.handleClick}
        >
          <TagLabel>{buttonLabel}</TagLabel>
        </Tag>
      </Box>
    )
  },
})
