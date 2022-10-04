import React from 'react'
import { Box, Text, Button, forwardRef } from '@chakra-ui/react'
import { css, Global } from '@emotion/react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import DatePicker from 'react-datepicker'
import { subDays, addDays } from 'date-fns'
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
      {!value ? 'Pilih tanggal' : value}
    </Button>
  )
})

const DatePickerRange = registerComponent('Date Picker Range', {
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
    start: '1',
    end: '30',
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
    start: { group: 'Design', type: 'string', options: { format: 'text' } },
    end: { group: 'Design', type: 'string', options: { format: 'text' } },
  },
  Component: (props) => {
    const title = props.hooks.useTemplate(props.properties.label)
    const start = props.hooks.useTemplate(props.properties.start)
    const end = props.hooks.useTemplate(props.properties.end)
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
      <Box padding={4} bg="white">
        <Text fontSize="lg" pb={2}>
          {title}
        </Text>
        <Global
          styles={css`
            @import 'https://unpkg.com/react-datepicker@4.7.0/dist/react-datepicker.css';
          `}
        />
        {
          //@ts-ignore
          <DatePicker
            withPortal
            selected={data.value ? dayjs(data.value as any).toDate() : null}
            onChange={(date) => {
              dayjs.extend(utc)
              const value = dayjs(date).utc(false).format()
              data.onChange(new Date(value))
            }}
            dateFormat="MMMM d, yyyy"
            //@ts-ignore
            includeDateIntervals={[
              {
                start: subDays(new Date(), +start || 1),
                end: addDays(new Date(), +end || 30),
              },
            ]}
            customInput={<CustomInput />}
            popperProps={{ strategy: 'fixed' }}
          />
        }
        {!!data.validation.error && (
          <Text fontSize="sm" color="red">
            {data.validation.error}
          </Text>
        )}
      </Box>
    )
  },
})

export default DatePickerRange
