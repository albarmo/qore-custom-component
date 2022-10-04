import {
  Box,
  Button,
  Text,
  HStack,
  Stack,
  Divider,
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
  IconCheckCircle,
  IconHistory,
  IconInfo,
  IconXCircle,
} from '@feedloop/icon'

interface IAvailableResult {
  status: string
  date: { date: string; time: string; dayName: string }
  service: {
    name: string
    price: string
    duration: string
    service_place_name: string
  }
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
    service: '',
    servicePlace: '',
    appointmentId: '',
    selected_date: '',
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
    selected_date: {
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
    const serviceId = props.hooks.useTemplate(props.properties.service)
    const user = props.hooks.useTemplate(props.properties.user)
    const servicePlaceId = props.hooks.useTemplate(
      props.properties.servicePlace,
    )
    const appointmentId = props.hooks.useTemplate(
      props.properties.appointmentId,
    )
    const selectedDate = props.hooks.useTemplate(props.properties.selected_date)

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

    const getDayName = (date, isLocalName: boolean) => {
      const localDayName = [
        'Minggu',
        'Senin',
        'Selasa',
        'Rabu',
        'Kamis',
        'Jumat',
        'Sabtu',
      ]
      const englishDayName = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
      ]
      const d = new Date(date)
      const dayName = isLocalName
        ? localDayName[d.getDay()]
        : englishDayName[d.getDay()]

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
      if (!serviceData || !slots) return
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
        })

      if (isAvailable) {
        setResult({
          status: 'available',
          date: {
            date: dayjs(selectedTimeSlot?.date).format('DD, MMMM YYYY'),
            time: selectedTimeSlot?.time,
            dayName: getDayName(selectedDate, true),
          },
          service: {
            name: serviceData.name,
            price: serviceData.price,
            duration: serviceData.duration,
            service_place_name: serviceData.service_place_name,
          },
        })
      }

      return isAvailable
    }, [selectedDate, selectedTimeSlot, serviceData, setInTimeSlot])

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
        date_string: result.date.date,
        is_rescheduled: true,
        unix_time: Math.round(new Date(result.date.date).getTime() / 1000),
      }
      const rescheduleAppointment = await updateAppointment(
        appointmentId,
        payload,
      )
      if (!rescheduleAppointment)
        throw new Error('Failed to create new appointment')

      inTimeSlot.map((slot) => updateSlot(slot.id, appointmentId))
      action.handleClick()
      await sendEmail(rescheduleAppointment)

      return rescheduleAppointment
    }, [
      user,
      result,
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
    }, [slots, serviceId, serviceData, selectedDate])

    const isDisabled = React.useMemo(() => {
      try {
        return !selectedDate || !selectedTimeSlot
      } catch (error) {
        return false
      }
    }, [selectedDate, selectedTimeSlot])

    React.useEffect(() => {
      if (!selectedDate || !selectedTimeSlot) return
      checkAvailability()
    }, [selectedDate, selectedTimeSlot])

    React.useEffect(() => {
      if (!selectedDate || !serviceId || !appointmentId) return
      ;(async () => {
        const serviceResult = await getService(serviceId)
        const slotsResult = await getSlots(
          servicePlaceId,
          new Date(selectedDate),
        )

        slotsResult && setDisplaySlot(slotsResult)
        serviceResult && setServiceData(serviceResult)
      })()
    }, [selectedDate, servicePlaceId, serviceId, appointmentId])

    const [setting, setSetting] = React.useState<any | undefined>()
    React.useEffect(() => {
      if (!servicePlaceId) return
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
                    view: 'All_Service_Place_Setting',
                    name: 'data',
                    params: {
                      servicePlaceId: servicePlaceId,
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
    }, [servicePlaceId])

    const isOffDay = React.useMemo(() => {
      if (!setting || !selectedDate) return
      const todayName = getDayName(selectedDate || new Date(), false)
      const result = !setting[todayName.toLocaleLowerCase()]

      return result
    }, [selectedDate, setting])

    const handleClose = () => {
      setSelectedTimeSlot(null)
      onClose()
    }

    return (
      <>
        <Modal isOpen={isOpen} onClose={handleClose} size="xs" isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalBody>
              <Box p="2" bg="white" rounded="md">
                {result.status === 'available' && (
                  <Box>
                    <Text fontWeight="semibold" fontSize="lg">
                      Reschedulle Janji Temu
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
                      mt="8"
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

          {isOffDay ? (
            <Box padding="4px" pt="0" mt="0" h="min-content">
              <Box p={'5'}>
                <Alert status="warning" p="5">
                  <AlertIcon />
                  Toko ini sedang tidak aktif pada hari ini, harap coba tanggal
                  lain
                </Alert>
              </Box>
            </Box>
          ) : (
            <Grid templateColumns="repeat(2, 1fr)" gap={6} p="4">
              {!loadingSlot &&
                displayedSlotOption?.map((slot, id) => (
                  <GridItem key={id} w="100%" h="10">
                    <Button
                      disabled={
                        slot.status === 'Booked' ||
                        !availableSlots.includes(slot.id) ||
                        (slot.time <= dayjs().format('HH:mm A') &&
                          slot.date == dayjs().format('YYYY-MM-DD'))
                      }
                      as={Button}
                      bg={
                        selectedTimeSlot?.id === slot.id ? 'blue.300' : '#fff'
                      }
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
                          !availableSlots.includes(slot.id)
                            ? 'gray'
                            : 'blue.500'
                        }
                      />
                      {slot.time}
                    </Button>
                  </GridItem>
                ))}
            </Grid>
          )}
          {!isOffDay && !displayedSlotOption?.length && !loadingSlot && (
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
