import React from 'react'
import { Box, Text, Button, forwardRef } from '@chakra-ui/react'
import { css, Global } from '@emotion/react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import DatePicker from 'react-datepicker'
import { IconClock } from '@feedloop/icon'
import { registerComponent } from '@qorebase/app-cli'

const CustomInput = forwardRef(({ value, onClick }, ref) => {
  const onClickHandler = React.useCallback(() => {
    onClick()
  }, [onClick])

  return (
    <Button
      justifyContent="space-between"
      borderRadius="md"
      variant="outline"
      width="100%"
      _focus={{ shadow: '0px' }}
      rightIcon={<IconClock />}
      onClick={onClickHandler}
      ref={ref}
      fontWeight="normal"
    >
      {!value ? 'Pilih Jam' : value}
    </Button>
  )
})

const TimePickerInput = registerComponent('Time Picker', {
  type: 'none',
  icon: 'IconClock',
  group: 'input',
  defaultProps: {
    label: 'Time Input',
    data: {
      inputID: 'Input',
      field: { type: 'date', options: { format: 'YYYY-MM-DD' } },
      validation: {
        required: false,
      },
    },
  },
  propDefinition: {
    label: { group: 'Design', type: 'string', options: { format: 'text' } },
    data: {
      group: 'Design',
      type: 'state',
      options: {
        inputID: 'date',
        type: 'custom',
        field: { type: 'date', options: { format: 'YYYY-MM-DD' } },
      },
    },
  },
  Component: (props) => {
    const title = props.hooks.useTemplate(props.properties.label)
    const data = props.hooks.useRuntimeInput(
      props.properties.data,
      props.data.page.row,
      {
        validate: (value) => {
          if (typeof value === 'undefined') {
            return { error: '' }
          } else if (!value) {
            return { error: 'Required field, Please enter the data' }
          }
        },
      },
    )

    return (
      <Box padding={4}>
        <Text fontSize="lg" pb={2}>
          {title}
        </Text>
        <Global
          styles={css`
            @import 'https://unpkg.com/react-datepicker@4.7.0/dist/react-datepicker.css';
          `}
        />
        <DatePicker
          selected={dayjs(data.value as any).toDate()}
          onChange={(date) => {
            dayjs.extend(utc)
            const value = dayjs(date).utc(false).format()
            data.onChange(new Date(value))
          }}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={30}
          timeCaption="Time"
          dateFormat="h:mm aa"
          customInput={<CustomInput />}
        />
        {!!data.validation.error && (
          <Text fontSize="sm" color="red">
            {data.validation.error}
          </Text>
        )}
      </Box>
    )
  },
})

export default TimePickerInput
