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
    selected_date: '',
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
    selected_date: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },
  },
  Component: (props) => {
    const title = props.hooks.useTemplate(props.properties.label)
    const store_id = props.hooks.useTemplate(props.properties.store_id)
    const date = props.hooks.useTemplate(props.properties.selected_date)

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

      const clinicSetting = {
        openHour: dayjs(setting.open).hour(),
        openMinute: dayjs(setting.open).minute(),
        closedHour: dayjs(setting.closed).hour(),
        closedMinute: dayjs(setting.closed).minute(),
        breakStartHour: dayjs(setting.break_start).hour(),
        breakStartMinute: dayjs(setting.break_start).minute(),
        breakEndHour: dayjs(setting.break_end).hour(),
        breakEndMinute: dayjs(setting.break_end).minute(),
      }

      return {
        ...clinicSetting,
      }
    }, [setting])

    const filterPassedTime = React.useCallback(
      (time) => {
        const currentTime = new Date()
        const selectedTime = new Date(time)

        const isToday =
          dayjs().format('DD:MM:YYYY') == dayjs(date).format('DD:MM:YYYY')

        const isPassedTime = isToday
          ? currentTime.getTime() < selectedTime.getTime()
          : true

        return isPassedTime
      },
      [setting, date],
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
            selected={
              typeof data.value === 'string' || !data.value
                ? null
                : dayjs(data.value as any).toDate()
            }
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
            filterTime={filterPassedTime}
            excludeTimes={
              setting && [
                setHours(
                  setMinutes(new Date(), timeSetting?.breakStartMinute),
                  timeSetting?.breakStartHour,
                ),
                setHours(
                  setMinutes(new Date(), timeSetting?.breakEndMinute - 30),
                  timeSetting?.breakEndHour - 1,
                ),
              ]
            }
            minTime={
              setting &&
              setHours(
                setMinutes(new Date(), timeSetting?.openMinute),
                timeSetting?.openHour,
              )
            }
            maxTime={
              setting &&
              setHours(
                setMinutes(new Date(), timeSetting?.closedMinute),
                timeSetting?.closedHour,
              )
            }
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
