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

export default registerComponent('Walk In Appointment', {
  type: 'none',
  icon: 'IconClick',
  group: 'button',
  defaultProps: {
    label: 'Button',
    size: 'md',
    style: 'solid',
    action: { type: 'none' },
    hidden: '',
    service: '',
    servicePlace: '',
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
    const servicePlaceId = props.hooks.useTemplate(
      props.properties.servicePlace,
    )
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
    const [selectedDate, setSelectedDate] = React.useState<Date>()
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
          pet: { name: '', type: '', race: '' },
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
          pet: {
            name: stringPetName,
            type: stringPetType,
            race: stringPetRace,
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

      const payload = {
        status: 'Booked',
        date: result.date.date,
        time: result.date.time,
        service_appointment: serviceId,
        service_place_appointment: servicePlaceId,
        is_walk_in_appointment: true,
        string_user_fullname: stringUserName,
        string_user_phone: stringUserPhone,
        string_user_address: stringUserAddress,
        string_pet_name: stringPetName,
        string_pet_gender: stringPetGender,
        string_pet_age: stringPetAge,
        string_pet_color: stringPetColor,
        string_pet_size: stringPetSize,
        appointment_pet_type: stringPetType,
        string_pet_race: stringPetRace,
      }

      const newAppointment = await insertAppointment(payload)
      if (!newAppointment) throw new Error('Failed to create new appointment')
      inTimeSlot.map((slot) => updateSlot(slot.id, newAppointment.id))
      action.handleClick()

      return newAppointment
    }, [
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
      if (!selectedDate || !serviceId) return
      ;(async () => {
        const serviceResult = await getService(serviceId)
        const slotsResult = await getSlots(servicePlaceId, selectedDate)

        slotsResult && setDisplaySlot(slotsResult)
        serviceResult && setServiceData(serviceResult)
      })()
    }, [selectedDate, servicePlaceId, serviceId])

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
                        <Text>{result.pet.name}</Text>
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
            {
              //@ts-ignore
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
                  {
                    start: subDays(new Date(), 1),
                    end: addDays(new Date(), 30),
                  },
                ]}
                customInput={<CustomInput timeToggle={dayjs(selectedDate)} />}
                popperProps={{ strategy: 'fixed' }}
              />
            }
          </Box>

          <Text fontSize="lg" pl="5">
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
                        (slot.time < dayjs().format('HH:MM A') &&
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
                  Silakan pilih hewan peliharaan dan tanggal pertemuan
                </Box>
              </Flex>
            </Box>
          )}
        </Box>
      </>
    )
  },
})
