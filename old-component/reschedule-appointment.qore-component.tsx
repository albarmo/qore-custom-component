import {
  Box,
  Button,
  Text,
  HStack,
  Stack,
  Divider,
  forwardRef,
  useDisclosure,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Grid,
  GridItem,
  Icon,
  Alert,
  AlertIcon,
  Flex,
} from '@chakra-ui/react'
import { registerComponent } from '@qorebase/app-cli'
import React from 'react'
import dayjs from 'dayjs'
import {
  IconCalendar,
  IconCheckCircle,
  IconHistory,
  IconInfo,
  IconXCircle,
} from '@feedloop/icon'
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

export default registerComponent('Reschedule Appointment', {
  type: 'none',
  icon: 'IconClick',
  group: 'button',
  defaultProps: {
    action: { type: 'none' },
    hidden: '',
    user: '',
    pet: '',
    service: '',
    servicePlace: '',
    appointmentId: '',
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
    servicePlace: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },
    appointmentId: {
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

    const { isOpen, onOpen, onClose } = useDisclosure()
    const petId = props.hooks.useTemplate(props.properties.pet)
    const serviceId = props.hooks.useTemplate(props.properties.service)
    const user = props.hooks.useTemplate(props.properties.user)
    const servicePlaceId = props.hooks.useTemplate(
      props.properties.servicePlace,
    )
    const appointmentId = props.hooks.useTemplate(
      props.properties.appointmentId,
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
    const [slots, setDisplaySlot] = React.useState<Slot[] | undefined>([])
    const [serviceData, setServiceData] = React.useState<any | undefined>()
    const [petData, setPetData] = React.useState<any | undefined>()
    const [appointmentData, setAppointmentData] = React.useState<any>()
    const [loadingSlot, setLoadingSlot] = React.useState<Boolean>(false)
    const [selectedTimeSlot, setSelectedTimeSlot] = React.useState<any | null>(
      null,
    )
    const [inTimeSlot, setInTimeSlot] = React.useState<Slot[] | null>()
    const [selectedDate, setSelectedDate] = React.useState<Date>()

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
    const getAppointment = async (appointmentId: string) => {
      if (!petId) return
      try {
        const response = await client.project.axios({
          method: 'get',
          headers,
          url: `${url}/v1/table/Appointments/row/${appointmentId}`,
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

    const updateSlot = async (id, appointmentId) => {
      try {
        let payload = { status: 'Booked', slot_appointment: appointmentId }
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

    const updateAppointment = async (appointmentId: string, payload: any) => {
      try {
        const response = await client.project.axios({
          method: 'patch',
          headers,
          url: `${url}/v1/table/Appointments/row/${appointmentId}`,
          data: {
            ...payload,
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

    const getAppointmentBookedSlots = async (appointmentId: string) => {
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
                  view: 'slot_by_apppointment',
                  name: 'booked_slots',
                  params: {
                    appointmentId: appointmentId,
                  },
                },
              },
            ],
          },
        })
        return response.data.results.booked_slots
      } catch (error) {
        throw new Error(error)
      }
    }

    const retriveSlot = async (slotId: string) => {
      try {
        let payload = { status: 'Open', slot_appointment: null }
        const response = await client.project.axios({
          method: 'patch',
          headers,
          url: `${url}/v1/table/groomer_slots/row/${slotId}`,
          data: {
            ...payload,
          },
        })
        return response.data
      } catch (error) {
        throw new Error(error)
      }
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
          slotInTime.includes(slot.time.slice(0, 5)) &&
          slot.status === 'Open'
        )
      })
      setInTimeSlot(filterInTimeSlot)
      const isAvailable = await checkTicket(filterInTimeSlot, slotNeeded)

      isAvailable && onOpen()
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

      const bookedAppointmentSlots = await getAppointmentBookedSlots(
        appointmentId,
      )
      if (!bookedAppointmentSlots)
        throw new Error('cannot get booked appointment')

      const retriveSlotData = await bookedAppointmentSlots.map((slot) =>
        retriveSlot(slot.id),
      )
      if (!retriveSlotData) throw new Error('Failed to retrive slots')

      const payload = {
        status: 'Booked',
        date: result.date.date,
        time: result.date.time,
        user_appointment: user,
        pet_appointment: petId,
        service_appointment: serviceId,
        service_place_appointment: servicePlaceId,
        date_string: result.date.date,
        is_rescheduled: true,
      }
      const rescheduleAppointment = await updateAppointment(
        appointmentId,
        payload,
      )
      if (!rescheduleAppointment)
        throw new Error('Failed to create new appointment')

      inTimeSlot.map((slot) => updateSlot(slot.id, appointmentId))
      action.handleClick()

      return rescheduleAppointment
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

    const [availableSlots, setAvailableSlots] = React.useState<any>([])
    const displayedSlotOption = React.useMemo(() => {
      if (!slots.length || !serviceData) return
      setLoadingSlot(true)

      let slotList = [
        ...new Map(slots.map((item) => [item['time'], item])).values(),
      ]
      const slotsByService = []
      const slotNeeded = +serviceData.service_duration / 30

      slots.forEach((currentSlot) => {
        const slotInTime = getInTimeSlot(
          currentSlot.time.slice(0, 5),
          slotNeeded,
        )
        const filterInTimeSlot = slots.filter((slot) => {
          return (
            slot.groomer === currentSlot.groomer &&
            slotInTime.includes(slot.time.slice(0, 5)) &&
            slot.status === 'Open'
          )
        })
        slotsByService.push(filterInTimeSlot)
      })
      const slotByServiceDuration = slotsByService.map((item) => {
        if (item.length === slotNeeded) {
          return item[0]
        }
      })

      let availableTimeSlot = slotByServiceDuration.filter(Boolean)
      availableTimeSlot = [
        ...new Map(
          availableTimeSlot.map((item) => [item['time'], item]),
        ).values(),
      ]
      const availableSlotIds = availableTimeSlot.map((slot) => slot?.id)
      setAvailableSlots(availableSlotIds)

      const timeAvailable = availableTimeSlot.map((slot) => slot.time)

      const bookedTimeSlot = slotList.filter(
        (item) => !timeAvailable.includes(item.time),
      )

      const result = [...availableTimeSlot, ...bookedTimeSlot]
      let sortedSlots = result.sort((a, b) => (a.time > b.time ? 1 : -1))

      setLoadingSlot(false)
      return sortedSlots
    }, [slots, serviceId, serviceData, selectedDate, petId])

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
      if (!selectedDate || !serviceId || !petId || !appointmentId) return
      ;(async () => {
        const serviceResult = await getService(serviceId)
        const petResult = await getPet(petId)
        const slotsResult = await getSlots(servicePlaceId, selectedDate)
        const appointmentResult = await getAppointment(appointmentId)

        slotsResult && setDisplaySlot(slotsResult)
        serviceResult && setServiceData(serviceResult)
        petResult && setPetData(petResult)
        appointmentId && setAppointmentData(appointmentResult)
      })()
    }, [selectedDate, servicePlaceId, serviceId, petId, appointmentId])

    return (
      <>
        <Modal isOpen={isOpen} onClose={onClose} size="xs" isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalBody>
              <Box p="2" bg="white" rounded="md">
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
                          {result.pet.name} - {result.pet.type}{' '}
                          {result.pet.race}
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
                      size="md"
                      onClick={() => bookAppointment()}
                      disabled={action.loading || isDisabled}
                      isLoading={action.loading}
                      loadingText="booking..."
                      colorScheme="blue"
                      spinner={null}
                    >
                      Ubah Jadwal Pertemuan
                    </Button>
                  </Box>
                )}

                {result.status === 'unavailable' && (
                  <Text fontWeight="semibold" fontSize="lg">
                    Slot waktu tidak tersedia
                  </Text>
                )}
              </Box>
            </ModalBody>
          </ModalContent>
        </Modal>
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
              selected={selectedDate || appointmentData?.date}
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

          <Text fontSize="lg" p="5">
            Pilih jam pertemuan
          </Text>

          <Box
            p={
              displayedSlotOption?.length && !availableSlots?.length ? '5' : '0'
            }
          >
            {displayedSlotOption?.length && !availableSlots?.length && (
              <Alert status="warning" p="5">
                <AlertIcon />
                Jam pertemuan tidak tersedia pada tanggal ini
              </Alert>
            )}
          </Box>

          <Grid templateColumns="repeat(2, 1fr)" gap={6} p="4">
            {!loadingSlot ? (
              displayedSlotOption?.map((slot, id) => (
                <GridItem key={id} w="100%" h="10">
                  <Button
                    disabled={
                      slot.status === 'Booked' ||
                      !availableSlots.includes(slot.id) ||
                      (appointmentData?.time === slot.time &&
                        appointmentData?.date === slot.date)
                    }
                    as={Button}
                    bg={selectedTimeSlot?.id === slot.id ? 'blue.300' : '#fff'}
                    w={'100%'}
                    p="4"
                    borderRadius={'md'}
                    onClick={() => {
                      setSelectedTimeSlot(slot)
                    }}
                    textAlign="left"
                    color="black"
                  >
                    <Icon
                      mr="2"
                      as={
                        slot.status === 'Booked' ||
                        !availableSlots.includes(slot.id)
                          ? IconXCircle
                          : IconCheckCircle
                      }
                      color={
                        !availableSlots.includes(slot.id) ? 'gray' : 'blue.500'
                      }
                    />
                    {slot.time}
                  </Button>
                </GridItem>
              ))
            ) : (
              <GridItem bg="#fff" w={'100%'} p="4" borderRadius={'md'}>
                <Icon as={IconCheckCircle} color="blue.500" />
                ...Loading
              </GridItem>
            )}
          </Grid>

          {!displayedSlotOption?.length && !loadingSlot && (
            <Box>
              <Flex justifyContent="center" alignItems="center">
                <Box
                  rounded="md"
                  w={'90%'}
                  textAlign="center"
                  p="5"
                  textColor="gray.400"
                  bg="#fff"
                >
                  <Icon as={IconInfo} mr="3" color="blue.500" />
                  Silakan pilih tanggal dan waktu pertemuan
                </Box>
              </Flex>
            </Box>
          )}
        </Box>
      </>
    )
  },
})
