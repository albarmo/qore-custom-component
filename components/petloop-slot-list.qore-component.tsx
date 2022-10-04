import React from 'react'
import dayjs from 'dayjs'
import { registerComponent } from '@qorebase/app-cli'
import { IconCheckCircle, IconXCircle } from '@feedloop/icon'
import {
  Box,
  Button,
  Text,
  Grid,
  GridItem,
  Icon,
  Alert,
  AlertIcon,
  VStack,
} from '@chakra-ui/react'

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

export default registerComponent('Slot List', {
  type: 'none',
  icon: 'IconClick',
  group: 'button',
  defaultProps: {
    hidden: '',
    servicePlace: '',
    selectedDate: '',
  },
  propDefinition: {
    hidden: {
      group: 'Visibility',
      type: 'string',
      options: { format: 'text' },
    },
    servicePlace: {
      group: 'Design',
      type: 'string',
      options: { format: 'text' },
    },
    selectedDate: {
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

    const store_id = props.hooks.useTemplate(props.properties.servicePlace)
    const selectedDate = props.hooks.useTemplate(props.properties.selectedDate)

    const [slots, setDisplaySlot] = React.useState<Slot[] | undefined>([])
    const [loadingSlot, setLoadingSlot] = React.useState<Boolean>(false)
    const [selectedTimeSlot, setSelectedTimeSlot] = React.useState<any | null>(
      null,
    )

    const getSlots = async (store_id: string, date: string) => {
      if (!store_id) return

      const selectedDate = date ? date : new Date()
      const formatedSelectedDate = dayjs(selectedDate).format('DD/MM/YYYY')
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
                    store_id: store_id,
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

    const getDayName = (date) => {
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
      const dayName = englishDayName[d.getDay()]

      return dayName
    }

    const displayedSlotOption = React.useMemo(() => {
      if (!slots.length) return
      setLoadingSlot(true)
      let sortedSlots = slots.sort((a, b) => (a.time > b.time ? 1 : -1))
      setLoadingSlot(false)

      return sortedSlots
    }, [slots, selectedDate, store_id])

    React.useEffect(() => {
      ;(async () => {
        const slotsResult = await getSlots(store_id, selectedDate)
        slotsResult && setDisplaySlot(slotsResult)
      })()
    }, [selectedDate, store_id])

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
                    view: 'All_Service_Place_Setting',
                    name: 'data',
                    params: {
                      servicePlaceId: store_id,
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

    const isOffDay = React.useMemo(() => {
      if (!setting) return
      const todayName = getDayName(selectedDate || new Date())
      const result = !setting[todayName.toLocaleLowerCase()]

      return result
    }, [selectedDate, setting])

    return (
      <>
        <Box padding="4px" pt="0" mt="0" h="min-content">
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
                  <GridItem key={id} w="100%" h="10" mt="5">
                    <Button
                      disabled={slot.status === 'Booked'}
                      as={Button}
                      bg={
                        selectedTimeSlot?.id === slot.id ? 'blue.300' : '#fff'
                      }
                      w={'100%'}
                      h="auto"
                      p="4"
                      borderRadius={'md'}
                      onClick={() => {
                        selectedTimeSlot?.id === slot.id
                          ? setSelectedTimeSlot(null)
                          : setSelectedTimeSlot(slot)
                      }}
                      textAlign="left"
                      color="black"
                    >
                      <Icon
                        mr="2"
                        as={
                          slot.status === 'Booked'
                            ? IconXCircle
                            : IconCheckCircle
                        }
                        color={slot.status === 'Booked' ? 'gray' : 'blue.500'}
                      />
                      <VStack textAlign="left" ml="3" lineHeight="1">
                        <Text w="full" fontSize="sm">
                          {slot.time}
                        </Text>
                        <Text w="full" fontSize="xs">
                          Groomer : {slot.groomer}
                        </Text>
                      </VStack>
                    </Button>
                  </GridItem>
                ))}
            </Grid>
          )}
        </Box>
      </>
    )
  },
})
