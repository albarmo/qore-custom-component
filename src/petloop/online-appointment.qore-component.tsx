import {
  Box,
  Button,
  Text,
  HStack,
  Stack,
  Divider,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  forwardRef,
} from '@chakra-ui/react'
import { registerComponent } from '@qorebase/app-cli'
import React from 'react'
import dayjs from 'dayjs'
import { IconCalendar, IconChevronDown, IconHistory } from '@feedloop/icon'
import DatePicker from 'react-datepicker'
import { css, Global } from '@emotion/react'
import { subDays, addDays } from 'date-fns'

const CustomInput = forwardRef(({ value, onClick }, ref) => {
  return (
    <Button
      justifyContent="space-between"
      borderRadius="md"
      variant="outline"
      width="100%"
      _focus={{ shadow: '0px' }}
      rightIcon={<IconCalendar />}
      onClick={onClick}
      ref={ref}
      fontWeight="normal"
    >
      {!value ? 'day/month/year' : value}
    </Button>
  )
})

interface IAvailableResult {
  status: string
  date: { date: string; time: string; dayName: string }
  service: {
    name: string
    price: string
    duration: string
    service_place_name: string
  }
  pet: { name: string; type: string; race: string }
}

type Slot = {
  id: number
  date: Date
  time: string
  store_id: string
  batch_id: string
  groomer: string
  status: 'Open' | 'Booked' | 'Closed'
  date_string: string
}

export default registerComponent('Online Appointment', {
  type: 'none',
  icon: 'IconClick',
  group: 'button',
  defaultProps: {
    label: 'Button',
    size: 'md',
    style: 'solid',
    action: { type: 'none' },
    hidden: '',
    user: '',
    pet: '',
    service: '',
    servicePlace: '',
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
    servicePlace: {
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

    const boxWidth = React.useRef<null | HTMLButtonElement>(null)
    const petId = props.hooks.useTemplate(props.properties.pet)
    const serviceId = props.hooks.useTemplate(props.properties.service)
    const user = props.hooks.useTemplate(props.properties.user)
    const servicePlaceId = props.hooks.useTemplate(
      props.properties.servicePlace,
    )

    const initalResult = {
      status: 'idle',
      date: { date: '', time: '', dayName: '' },
      service: {
        name: '',
        price: '',
        duration: '',
        service_place_name: '',
      },
      pet: { name: '', type: '', race: '' },
    }
    const [result, setResult] = React.useState<IAvailableResult>(initalResult)
    const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
    const [slots, setDisplaySlot] = React.useState<Slot[] | undefined>([])
    const [serviceData, setServiceData] = React.useState<any | undefined>()
    const [petData, setPetData] = React.useState<any | undefined>()
    const [loadingSlot, setLoadingSlot] = React.useState<Boolean>(false)
    const [selectedTimeSlot, setSelectedTimeSlot] = React.useState<any | null>(
      null,
    )
    const [inTimeSlot, setInTimeSlot] = React.useState<Slot[] | null>()

    const getSlots = async (servicePlaceId: string, date: Date) => {
      if (!servicePlaceId || !date) return
      const formatedSelectedDate = dayjs(date).format('DD/MM/YYYY')
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
                  view: 'store_slots',
                  name: 'slots',
                  params: {
                    store_id: servicePlaceId,
                    date: formatedSelectedDate,
                  },
                },
              },
            ],
          },
        })
        return response.data.results.slots
      } catch (error) {
        throw new Error(error)
      }
    }
    const getService = async (serviceId: string) => {
      if (!serviceId) return
      try {
        const response = await client.project.axios({
          method: 'get',
          headers,
          url: `${url}/v1/table/Services/row/${serviceId}`,
        })
        return response.data
      } catch (error) {
        throw new Error(error)
      }
    }
    const getPet = async (petId: string) => {
      if (!petId) return
      try {
        const response = await client.project.axios({
          method: 'get',
          headers,
          url: `${url}/v1/table/Pet/row/${petId}`,
        })
        return response.data
      } catch (error) {
        throw new Error(error)
      }
    }

    const getDayName = (date) => {
      const days = [
        'Minggu',
        'Senin',
        'Selasa',
        'Rabu',
        'Kamis',
        'Jumat',
        'Sabtu',
      ]
      const d = new Date(date)
      const dayName = days[d.getDay()]

      return dayName
    }

    const updateSlot = async (id, selectedSlotId, appointmentId) => {
      try {
        let payload = {}
        if (selectedSlotId === id) {
          payload['status'] = 'Booked'
          payload['slot_appointment'] = appointmentId
        } else {
          payload['status'] = 'Booked'
        }

        const response = await client.project.axios({
          method: 'patch',
          headers,
          url: `${url}/v1/table/groomer_slots/row/${id}`,
          data: {
            ...payload,
          },
        })
        return response.data
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
        return response.data
      } catch (error) {
        throw new Error(error)
      }
    }

    const checkTicket = async (inTimeSlot, slotNeeded) => {
      if (!inTimeSlot.length || inTimeSlot?.length !== slotNeeded) return false

      const slotsStatus = inTimeSlot.map((slot) => slot.status)
      const checkAvailable =
        !slotsStatus.includes('Booked') ||
        (!slotsStatus.includes('Closed') && slotsStatus.length)

      return checkAvailable
    }

    const getInTimeSlot = (start, service) => {
      let allTimes = []
      let startHours = parseInt(start.split(':')[0])
      let startMinutes = parseInt(start.split(':')[1])

      let open = dayjs().set('hour', startHours).set('minute', startMinutes)
      allTimes.push(dayjs(open).format('HH:mm'))

      for (let i = 1; i < service; i++) {
        open = dayjs(open).add(30, 'minute')
        allTimes.push(dayjs(open).format('HH:mm'))
      }

      return allTimes
    }

    const checkAvailability = React.useCallback(async () => {
      if (!serviceData || !petData || !slots) return

      const slotNeeded = +serviceData.service_duration / 30
      const slotInTime = getInTimeSlot(
        selectedTimeSlot.time.slice(0, 5),
        slotNeeded,
      )

      const filterInTimeSlot = slots.filter((slot) => {
        return (
          slot.groomer === selectedTimeSlot.groomer &&
          slotInTime.includes(slot.time.slice(0, 5))
        )
      })

      console.log({ filterInTimeSlot })

      setInTimeSlot(filterInTimeSlot)
      const isAvailable = await checkTicket(filterInTimeSlot, slotNeeded)

      !isAvailable &&
        setResult({
          status: 'unavailable',
          date: { date: '', time: '', dayName: '' },
          service: {
            name: '',
            price: '',
            duration: '',
            service_place_name: '',
          },
          pet: { name: '', type: '', race: '' },
        })

      if (isAvailable) {
        setResult({
          status: 'available',
          date: {
            date: dayjs(selectedTimeSlot?.date).format('DD, MMMM YYYY'),
            time: selectedTimeSlot?.time,
            dayName: getDayName(selectedDate),
          },
          service: {
            name: serviceData.name,
            price: serviceData.price,
            duration: serviceData.duration,
            service_place_name: serviceData.service_place_name,
          },
          pet: {
            name: petData.name,
            type: petData.pet_type_name,
            race: petData.pet_race_name,
          },
        })
      }

      return isAvailable
    }, [selectedDate, selectedTimeSlot, serviceData, petData, setInTimeSlot])

    const bookAppointment = React.useCallback(async () => {
      if (
        result.status === 'unavailable' ||
        !selectedTimeSlot ||
        !slots ||
        !serviceData
      )
        return

      const payload = {
        status: 'Booked',
        date: result.date.date,
        time: result.date.time,
        user_appointment: user,
        pet_appointment: petId,
        service_appointment: serviceId,
        service_place_appointment: servicePlaceId,
        date_string: result.date.date,
      }
      const newAppointment = await insertAppointment(payload)
      if (!newAppointment) throw new Error('Failed to create new appointment')
      inTimeSlot.map((slot) =>
        updateSlot(slot.id, selectedTimeSlot.id, newAppointment.id),
      )
      action.handleClick()

      return newAppointment
    }, [
      user,
      result,
      petId,
      serviceId,
      servicePlaceId,
      slots,
      selectedTimeSlot,
      serviceData,
      inTimeSlot,
    ])

    const action = props.hooks.useActionTrigger(
      props.properties.action,
      props.data.page.row,
      props.pageSource,
    )

    const displayedSlotOption = React.useMemo(() => {
      if (!slots.length || !serviceData) return
      setLoadingSlot(true)

      const availableSlot = slots.filter((slot) => slot.status === 'Open')
      let sortedSlots = availableSlot.sort((a, b) => (a.time > b.time ? 1 : -1))

      const arrayUniqueByKey = [
        ...new Map(sortedSlots.map((item) => [item['time'], item])).values(),
      ]

      setLoadingSlot(false)
      return arrayUniqueByKey
    }, [slots, serviceId, serviceData])

    const isDisabled = React.useMemo(() => {
      try {
        return !selectedDate || !selectedTimeSlot || !petData
      } catch (error) {
        return false
      }
    }, [petData, selectedDate, selectedTimeSlot])

    React.useEffect(() => {
      if (!selectedDate || !selectedTimeSlot) return
      checkAvailability()
    }, [selectedDate, selectedTimeSlot])

    React.useEffect(() => {
      if (!selectedDate || !serviceId || !petId) return
      ;(async () => {
        const serviceResult = await getService(serviceId)
        const petResult = await getPet(petId)
        const slotsResult = await getSlots(servicePlaceId, selectedDate)

        slotsResult && setDisplaySlot(slotsResult)
        serviceResult && setServiceData(serviceResult)
        petResult && setPetData(petResult)
      })()
    }, [selectedDate, servicePlaceId, serviceId, petId])

    return (
      <Box padding="4px" pt="0" mt="0" h="min-content">
        <Global
          styles={css`
            @import 'https://unpkg.com/react-datepicker@4.7.0/dist/react-datepicker.css';
          `}
        />
        <Box
          p={4}
          pt={0}
          display={props.properties.hidden ? 'none' : undefined}
        >
          <Text fontSize="lg" pb={2} mt="5">
            Pilih tanggal pertemuan
          </Text>
          <DatePicker
            withPortal
            selected={selectedDate}
            onChange={(date) => {
              setSelectedDate(date)
              setSelectedTimeSlot(null)
              setResult({ ...initalResult })
            }}
            dateFormat="MMMM d, yyyy"
            //@ts-ignore
            includeDateIntervals={[
              { start: subDays(new Date(), 1), end: addDays(new Date(), 30) },
            ]}
            customInput={<CustomInput timeToggle={dayjs(selectedDate)} />}
            popperProps={{ strategy: 'fixed' }}
          />
        </Box>

        <Box p={4} display={props.properties.hidden ? 'none' : undefined}>
          <Text fontSize="lg" pb={2}>
            Pilih jam pertemuan
          </Text>
          <Menu autoSelect={false}>
            <MenuButton
              as={Button}
              width="100%"
              ref={boxWidth}
              textAlign="left"
              borderRadius="md"
              variant="outline"
              fontWeight="normal"
              _focus={{ shadow: '0px' }}
              rightIcon={<IconChevronDown />}
              placeholder="Pilih jam pertemuan"
            >
              Pukul {selectedTimeSlot && selectedTimeSlot?.time}
              {!selectedTimeSlot && 'Pilih jam'}
            </MenuButton>

            <MenuList
              border="0px"
              width={boxWidth?.current?.offsetWidth}
              placeholder="Pilih jam pertemuan"
            >
              {!loadingSlot ? (
                displayedSlotOption?.map((slot) => (
                  <MenuItem
                    onClick={() => {
                      setSelectedTimeSlot(slot)
                    }}
                    isDisabled={slot.status !== 'Open'}
                  >
                    {slot.time}
                  </MenuItem>
                ))
              ) : (
                <Text pl="4">Loading...</Text>
              )}

              {!displayedSlotOption?.length && !loadingSlot && (
                <Text pl="4">Jam belum tersedia</Text>
              )}
            </MenuList>
          </Menu>
        </Box>

        <Box p="5" bg="white" rounded="md" mt="5">
          {result.status === 'available' && (
            <Box>
              <Text fontWeight="semibold" fontSize="lg">
                Slot waktu tersedia
              </Text>
              <Divider
                orientation="horizontal"
                mt="5"
                mb="5"
                variant="dashed"
                size="1px"
              />
              <Stack lineHeight="1" mt="3">
                <Text fontWeight="semibold">
                  {result.date.dayName}, {result.date.date}
                </Text>
                <Text>Pukul {result.date.time}</Text>

                <Stack lineHeight="1">
                  <Text fontWeight="semibold" mt="3">
                    Hewan Peliharan
                  </Text>
                  <Text>
                    {result.pet.name} - {result.pet.type} {result.pet.race}
                  </Text>
                </Stack>
              </Stack>
              <Divider
                orientation="horizontal"
                mt="5"
                mb="5"
                variant="dashed"
                size="1px"
              />
              <HStack mt="3">
                <IconHistory />
                <Stack lineHeight="1" ml="8">
                  <Text fontWeight="semibold">{result.service.name}</Text>
                  <Text>{result.service?.service_place_name}</Text>
                </Stack>
              </HStack>
              <Button
                mt="5"
                display={{ base: 'initial', md: 'none' }}
                width="full"
                size="sm"
                onClick={() => bookAppointment()}
                disabled={action.loading || isDisabled}
                variant={props.properties.style}
                isLoading={action.loading}
                loadingText="booking..."
                colorScheme="blue"
                spinner={null}
              >
                Booking Sekarang
              </Button>
            </Box>
          )}

          {result.status === 'unavailable' && (
            <Text fontWeight="semibold" fontSize="lg">
              Slot waktu tidak tersedia
            </Text>
          )}
        </Box>
      </Box>
    )
  },
})
