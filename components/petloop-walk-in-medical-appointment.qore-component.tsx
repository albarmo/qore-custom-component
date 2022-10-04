import React from 'react'
import dayjs from 'dayjs'
import { registerComponent } from '@qorebase/app-cli'
import { Box, Button, Alert, AlertIcon } from '@chakra-ui/react'

export default registerComponent('Walk In Medical Appointment', {
  type: 'none',
  icon: 'IconClick',
  group: 'button',
  defaultProps: {
    action: { type: 'none' },
    hidden: '',

    service: '',
    store_id: '',
    string_user_fullname: '',
    string_user_phone: '',
    string_user_address: '',
    string_pet_name: '',
    string_pet_gender: '',
    string_pet_age: '',
    string_pet_color: '',
    string_pet_size: '',
    appointment_pet_type: '',
    appointment_pet_race: '',
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
    string_user_fullname: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },
    string_user_phone: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },
    string_user_address: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },
    string_pet_name: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },
    string_pet_gender: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },
    string_pet_age: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },
    string_pet_color: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },
    string_pet_size: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },
    appointment_pet_type: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },
    appointment_pet_race: {
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
    const serviceId = props.hooks.useTemplate(props.properties.service)
    const stringUserName = props.hooks.useTemplate(
      props.properties.string_user_fullname,
    )
    const stringUserPhone = props.hooks.useTemplate(
      props.properties.string_user_phone,
    )
    const stringUserAddress = props.hooks.useTemplate(
      props.properties.string_user_address,
    )
    const stringPetName = props.hooks.useTemplate(
      props.properties.string_pet_name,
    )
    const stringPetGender = props.hooks.useTemplate(
      props.properties.string_pet_gender,
    )
    const stringPetAge = props.hooks.useTemplate(
      props.properties.string_pet_age,
    )
    const stringPetColor = props.hooks.useTemplate(
      props.properties.string_pet_color,
    )
    const stringPetSize = props.hooks.useTemplate(
      props.properties.string_pet_size,
    )
    const stringPetType = props.hooks.useTemplate(
      props.properties.appointment_pet_type,
    )
    const stringPetRace = props.hooks.useTemplate(
      props.properties.appointment_pet_race,
    )
    const date = props.hooks.useTemplate(props.properties.selected_date)
    const time = props.hooks.useTemplate(props.properties.selected_time)

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
      if (!serviceId || !date || !time) return

      const formatedDate = dayjs(date).format('DD, MMMM YYYY')
      const formatedTIme = dayjs(new Date(time)).format('hh:mm A')
      const payload = {
        status: 'Booked',
        type: 'Medical',
        is_walk_in_appointment: true,
        date: dayjs(date).format(),
        date_string: formatedDate,
        time: formatedTIme,
        service_appointment: serviceId,
        service_place_appointment: storeId,
        string_user_fullname: stringUserName,
        string_user_phone: stringUserPhone,
        string_user_address: stringUserAddress,
        string_pet_name: stringPetName,
        string_pet_age: stringPetAge,
        appointment_pet_gender: stringPetGender,
        appointment_pet_color: stringPetColor,
        appointment_pet_size: stringPetSize,
        appointment_pet_type: stringPetType,
        appointment_pet_race: stringPetRace,
        unix_time: Math.round(new Date(date).getTime() / 1000),
      }

      const newAppointment = await insertAppointment(payload)
      if (!newAppointment) throw new Error('Failed to create new appointment')
      action.handleClick()

      return newAppointment
    }, [serviceId, date, time])

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
            disabled={action.loading || isOffDay || !date || !time}
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
