import React from 'react'
import dayjs from 'dayjs'
import { registerComponent } from '@qorebase/app-cli'
import { Box, Button, Alert, AlertIcon } from '@chakra-ui/react'

export default registerComponent('Medical Appointment', {
  type: 'none',
  icon: 'IconClick',
  group: 'button',
  defaultProps: {
    action: { type: 'none' },
    hidden: '',
    user: '',
    pet: '',
    service: '',
    store_id: '',
    selected_date: '',
    selected_time: '',
  },
  propDefinition: {
    action: { group: 'Action', type: 'action', options: { type: 'none' } },
    hidden: {
      group: 'Visibility',
      type: 'string',
      options: { format: 'text' },
    },
    user: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },

    pet: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },
    service: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },
    store_id: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },
    selected_date: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },
    selected_time: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },
  },

  Component: (props) => {
    const client = props.hooks.useClient()
    const url = 'https://staging-qore-data-teacher-593643.qore.dev'
    const headers = {
      accept: '*/*',
      'x-qore-engine-admin-secret': 'UM5MlKofJjxhC0KQejD8WZi2cmbpAN5A',
    }

    const storeId = props.hooks.useTemplate(props.properties.store_id)
    const user = props.hooks.useTemplate(props.properties.user)
    const petId = props.hooks.useTemplate(props.properties.pet)
    const serviceId = props.hooks.useTemplate(props.properties.service)
    const date = props.hooks.useTemplate(props.properties.selected_date)
    const time = props.hooks.useTemplate(props.properties.selected_time)

    async function sendEmail(appointment) {
      if (!appointment) return
      try {
        const { data } = await client.project.axios({
          method: 'post',
          url: `https://staging-qore-pipeline-teacher-593643.qore.dev/api/workflow/668e9f83-b19c-4691-8340-977db9bd0083/instance/463181d6-fb62-4a0d-88a0-ac7bb6a9fd3a/inbound`,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:102.0) Gecko/20100101 Firefox/102.0',
            Accept: 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Content-Type': 'application/json',
            'x-qonduit-admin-secret': '6IAapEo0ju9GEzuxIqwAdrS0q8kD8fOw',
            Origin: 'https://staging-qore-pipeline-teacher-593643.qore.dev',
            Connection: 'keep-alive',
            Referer:
              'https://staging-qore-pipeline-teacher-593643.qore.dev/workflows/668e9f83-b19c-4691-8340-977db9bd0083',
            Cookie: 'qonduit-admin-secret=6IAapEo0ju9GEzuxIqwAdrS0q8kD8fOw',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            TE: 'trailers',
          },
          data: { appointmentId: appointment.id },
        })
        return data
      } catch (error) {
        throw new Error(error)
      }
    }

    const insertAppointment = async (payload) => {
      try {
        const response = await client.project.axios({
          method: 'post',
          headers,
          url: `${url}/v1/table/Appointments`,
          data: {
            data: { ...payload },
          },
        })
        if (!response.data) throw new Error('Failed to create appointment')
        const newApponitment = response.data
        return newApponitment
      } catch (error) {
        throw new Error(error)
      }
    }

    const bookAppointment = React.useCallback(async () => {
      if (!user || !petId || !serviceId || !date || !time) return

      const formatedDate = dayjs(date).format('DD, MMMM YYYY')
      const formatedTIme = dayjs(new Date(time)).format('hh:mm A')
      const payload = {
        status: 'Booked',
        date: dayjs(date).format(),
        time: formatedTIme,
        user_appointment: user,
        pet_appointment: petId,
        service_appointment: serviceId,
        service_place_appointment: storeId,
        date_string: formatedDate,
        type: 'Medical',
        unix_time: Math.round(new Date(date).getTime() / 1000),
      }
      const newAppointment = await insertAppointment(payload)
      if (!newAppointment) throw new Error('Failed to create new appointment')
      action.handleClick()
      await sendEmail(newAppointment)

      return newAppointment
    }, [user, petId, serviceId, date, time])

    const action = props.hooks.useActionTrigger(
      props.properties.action,
      props.data.page.row,
      props.pageSource,
    )

    const [setting, setSetting] = React.useState<any | undefined>()
    React.useEffect(() => {
      if (!storeId) return
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
                      store_id: storeId,
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
    }, [storeId])

    const getDayName = (date) => {
      const days = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
      ]
      var d = new Date(date)
      var dayName = days[d.getDay()]
      return dayName
    }

    const isOffDay = React.useMemo(() => {
      if (!setting || !date) return
      const todayName = getDayName(date)
      const result = !setting[todayName.toLocaleLowerCase()]

      return result
    }, [date, setting])

    return (
      <>
        {isOffDay && (
          <Box padding="4px" pt="0" mt="0" h="min-content">
            <Box p={'5'}>
              <Alert status="warning" p="5">
                <AlertIcon />
                Toko ini sedang tidak aktif pada hari ini, harap coba tanggal
                lain
              </Alert>
            </Box>
          </Box>
        )}
        <Box p="5">
          <Button
            display={{ base: 'initial' }}
            width="full"
            size="md"
            onClick={() => bookAppointment()}
            disabled={action.loading || isOffDay || !date || !time || !petId}
            isLoading={action.loading}
            loadingText="booking..."
            colorScheme="blue"
            spinner={null}
          >
            Booking Sekarang
          </Button>
        </Box>
      </>
    )
  },
})
