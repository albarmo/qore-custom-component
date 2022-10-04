function generateTimeInterval(timeString) {
  let H = +timeString.substr(0, 2)
  let h = H % 24

  let forrmat2DigitHours = h < 10 ? `0${h}` : h
  let timeFormat = forrmat2DigitHours < 12 ? 'AM' : 'PM'
  const formatedTimeString = `${forrmat2DigitHours}${timeString.substr(2, 3)}`

  const timeSlot = `${formatedTimeString} ${timeFormat}`
  return timeSlot
}

function returnTimesInBetween(start, end) {
  var timesInBetween = []
  var startHours = parseInt(start.split(':')[0])
  var startMinutes = parseInt(start.split(':')[1])
  var endHours = parseInt(end.split(':')[0])
  var endMinutes = parseInt(end.split(':')[1])

  if (startMinutes == 30) startHours++

  for (var i = startHours; i < endHours; i++) {
    timesInBetween.push(i < 10 ? '0' + i + ':00' : i + ':00')
    timesInBetween.push(i < 10 ? '0' + i + ':30' : i + ':30')
  }

  timesInBetween.push(endHours + ':00')
  if (endMinutes == 30) timesInBetween.push(endHours + ':30')

  const temp = timesInBetween.map(
    (time) => time !== end && generateTimeInterval(time),
  )
  return temp.filter(Boolean)
}

const get2DigitTime = (time) => {
  const hours = new Date(time)
  const hoursFormated = hours.setHours(hours.getHours() + 7)

  const formatedTime = new Date(hoursFormated).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  return formatedTime
}

function getDatesInRange(startDate, endDate) {
  const date = new Date(startDate.getTime())
  date.setDate(date.getDate())
  const dates = []

  while (date < endDate) {
    dates.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }

  return dates
}

const generateTimeSlot = async (id, times, storeSetting, batchId, dateTail) => {
  const groomerInStore = storeSetting.groomer
  var grommerArray = Array(groomerInStore)
    .fill()
    .map((v, i) => i + 1)

  const d1 = dateTail ? new Date(dateTail) : new Date()
  const startDate = new Date(d1.setDate(new Date(d1.getDate() + 1)))
  const d2 = new Date(startDate)
  const endDate = new Date(d2.setDate(new Date(d2.getDate() + 1)))
  const dates = getDatesInRange(startDate, endDate)

  const timeSlotPayload = dates.flatMap((date) => {
    return times.flatMap((time) => {
      return grommerArray.flatMap((val) => {
        return {
          date,
          time,
          groomer: val,
          storeId: id,
          status: 'Open',
          batchId: batchId,
          unix_time: Math.round(new Date(date).getTime() / 1000),
          date_string: date
            .toISOString()
            .slice(0, 10)
            .split('-')
            .reverse()
            .join('/'),
        }
      })
    })
  })

  return { slots: timeSlotPayload, finishDate: endDate }
}

async function myFunction(input) {
  let servicePlaceSetting = input.item
  const storeSetting = {
    groomer: servicePlaceSetting.groomer_in_store,
    working_days: servicePlaceSetting.working_days,
  }

  if (!servicePlaceSetting) return 'Failed get servicePlaceSetting!'

  let open = get2DigitTime(servicePlaceSetting.open)
  let breakStart = get2DigitTime(servicePlaceSetting.break_start)
  let breakEnd = get2DigitTime(servicePlaceSetting.break_end)
  let closed = get2DigitTime(servicePlaceSetting.closed)

  const beforeBreak = returnTimesInBetween(open, breakStart)
  const afterBreak = returnTimesInBetween(breakEnd, closed)
  const timeSlot = beforeBreak.concat(afterBreak)

  const batchDate = new Date()
  const batchId = batchDate.getTime()
  const slotList = await generateTimeSlot(
    servicePlaceSetting.service_place_setting,
    timeSlot,
    storeSetting,
    batchId,
    servicePlaceSetting.slots_tail,
  )

  console.log(slotList)
  return { slotList, servicePlaceSetting }
}

const input = {
  item: {
    id: 28,
    open: '2022-06-14T01:00:00.000Z',
    closed: '2022-06-14T10:00:00.000Z',
    friday: true,
    monday: true,
    sunday: true,
    day_off: {
      dates: [],
    },
    tuesday: true,
    saturday: true,
    thursday: true,
    break_end: '2022-06-14T06:00:00.000Z',
    has_slots: false,
    wednesday: true,
    slots_tail: '2022-07-11',
    break_start: '2022-06-14T05:00:00.000Z',
    working_days: 30,
    groomer_in_store: 1,
    service_place_name: 'Purple Pet Store',
    service_place_setting: 58,
    trigger_slot_generator: null,
  },
}

myFunction(input)
