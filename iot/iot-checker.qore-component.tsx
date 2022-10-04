import React from 'react'
import { registerComponent } from '@qorebase/app-cli'
import { Box } from '@chakra-ui/react'

export default registerComponent('IOT Checker', {
  type: 'none',
  icon: 'ButtonAlt',
  group: 'button',
  defaultProps: {
    is_gold_user: '',
    is_gold_insight: '',
    action: { type: 'none' },
    hidden: '',
  },
  propDefinition: {
    is_gold_user: {
      group: 'Source',
      type: 'expression',
      options: {},
    },
    is_gold_insight: {
      group: 'Source',
      type: 'expression',
      options: {},
    },
    action: { group: 'Action', type: 'action', options: { type: 'none' } },
    hidden: {
      group: 'Visibility',
      type: 'expression',
      options: {},
    },
  },
  Component: (props) => {
    const action = props.hooks.useActionTrigger(
      props.properties.action,
      props.data.page.row,
      props.pageSource,
    )

    const hidden = props.hooks.useTemplate(props.properties.hidden)
    const isHidden = React.useMemo(() => {
      try {
        return !!JSON.parse(hidden)
      } catch (error) {
        return false
      }
    }, [hidden])

    const isGoldUserData = props.hooks.useTemplate(
      props.properties.is_gold_user,
    )
    const goldUser = React.useMemo(() => {
      try {
        return !!JSON.parse(isGoldUserData)
      } catch (error) {
        return false
      }
    }, [isGoldUserData])

    const isGoldInsightData = props.hooks.useTemplate(
      props.properties.is_gold_insight,
    )
    const goldInsight = React.useMemo(() => {
      try {
        return !!JSON.parse(isGoldInsightData)
      } catch (error) {
        return false
      }
    }, [isGoldInsightData])

    React.useEffect(() => {
      if (!isGoldInsightData || !isGoldUserData) return
      if (goldInsight && !goldUser) {
        action.handleClick()
      }
    }, [goldUser, goldInsight, isGoldInsightData, isGoldUserData])

    if (isHidden) return null

    return (
      <Box
        backgroundColor="white"
        padding={4}
        visibility={isHidden ? 'hidden' : 'visible'}
      >
        --- IOT CHECKER ---
      </Box>
    )
  },
})
