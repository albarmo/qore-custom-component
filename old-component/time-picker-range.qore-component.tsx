import React from 'react'
import { Box, Text, Button, forwardRef } from '@chakra-ui/react'
import { css, Global } from '@emotion/react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import DatePicker from 'react-datepicker'
import { IconClock } from '@feedloop/icon'
import { registerComponent } from '@qorebase/app-cli'
import { setHours, setMinutes } from 'date-fns'

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
      {!value ? 'Pilih jam' : value}
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
    store_id: '',
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
    store_id: { group: 'Design', type: 'string', options: { format: 'text' } },
  },
  Component: (props) => {
    const title = props.hooks.useTemplate(props.properties.label)
    const store_id = props.hooks.useTemplate(props.properties.store_id)
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
    const client = props.hooks.useClient()
    const url = 'https://staging-qore-data-teacher-593643.qore.dev'
    const headers = {
      accept: '*/*',
      'x-qore-engine-admin-secret': 'UM5MlKofJjxhC0KQejD8WZi2cmbpAN5A',
    }

    const [setting, setSetting] = React.useState<any | undefined>()
    React.useEffect(() => {
      if (!store_id) return
      ;(async () => {
        try {
          const response = await client.project.axios({
            method: 'post',
            headers,
            url: `${url}/v1/execute`,
            data: {
              operations: [
                {
                  operation: 'Select',
                  instruction: {
                    view: 'clinic_setting_by_store_id',
                    name: 'data',
                    params: {
                      store_id: store_id,
                    },
                  },
                },
              ],
            },
          })

          setSetting(response.data.results?.data[0])
          return response.data
        } catch (error) {
          throw new Error(error)
        }
      })()
    }, [store_id])

    const timeSetting = React.useMemo(() => {
      if (!setting) return

      const openHour = dayjs(setting.open).hour()
      const openMinute = dayjs(setting.open).minute()
      const closedHour = dayjs(setting.closed).hour()
      const closedMinute = dayjs(setting.closed).minute()
      return { openHour, openMinute, closedHour, closedMinute }
    }, [setting])

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
        {
          //@ts-ignore
          <DatePicker
            selected={data.value ? dayjs(data.value as any).toDate() : null}
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
            minTime={setHours(
              setMinutes(new Date(), timeSetting?.openMinute),
              timeSetting?.openHour,
            )}
            maxTime={setHours(
              setMinutes(new Date(), timeSetting?.closedMinute),
              timeSetting?.closedHour,
            )}
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

export default TimePickerInput
