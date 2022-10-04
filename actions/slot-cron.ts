import parser from 'cron-parser'

function getMondayOfNextWeek(d: Date = new Date()): Date {
  d.setDate(d.getDate() + 7)
  d.setHours(0, 0, 0)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

function getOccurances(expr: string, options: { start: Date; end: Date }) {
  const interval = parser.parseExpression(expr, {
    currentDate: options.start,
    endDate: options.end,
    iterator: true,
  })

  const result = []
  while (true) {
    try {
      //@ts-ignore
      result.push(interval.next().value.toISOString())
    } catch (e) {
      break
    }
  }

  return result
}

type GetSchedulesOptions = {
  duration: number
  workingDays: number
  workHourStart: number
  workHourEnd: number
  weekStart: number
  lunchBreakHour: number
  breakDuration: number
}
function getSchedules(options: GetSchedulesOptions) {
  const DURATION = options.duration
  const WORKING_DAYS = options.workingDays
  const WORK_HOUR_START = options.workHourStart
  const WORK_HOUR_END = options.workHourEnd
  const WEEK_START = options.weekStart
  const LUNCH_BREAK_HOUR = options.lunchBreakHour
  const BREAK_DURATION = options.breakDuration

  const exprEven = `0 ${WORK_HOUR_START}-${LUNCH_BREAK_HOUR - 1}/${
    DURATION / 30
  },${LUNCH_BREAK_HOUR + BREAK_DURATION}-${WORK_HOUR_END - 1}/${
    DURATION / 30
  } * * ${WEEK_START}-${WORKING_DAYS}`
  const exprOdd = `${DURATION % 60} ${
    WORK_HOUR_START + Math.floor(DURATION / 60)
  }-${LUNCH_BREAK_HOUR - 1}/${DURATION / 30},${
    LUNCH_BREAK_HOUR + BREAK_DURATION + Math.floor(DURATION / 60)
  }-${WORK_HOUR_END - 1}/${DURATION / 30} * * ${WEEK_START}-${WORKING_DAYS}`

  const start = getMondayOfNextWeek()
  const end = new Date(start)
  end.setDate(end.getDate() + WORKING_DAYS)

  const schedules = [
    ...getOccurances(exprEven, { start, end }),
    ...getOccurances(exprOdd, { start, end }),
  ]

  return schedules.sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime()
  })
}

const STORE_CONFIG = {
  serviceDuration: 90,
  workingDays: 5,
  workHourStart: 8,
  workHourEnd: 17,
  weekStart: 1,
  lunchBreakHour: 12,
  breakDuration: 1,
}

type GenerateSlotsParams = {
  serviceId: string
  serviceDuration: number
  groomerId: string
  storeId: string
}
function generateSlots(params: GenerateSlotsParams) {
  const batchId = new Date().getTime()
  const schedules = getSchedules({
    duration: params.serviceDuration || STORE_CONFIG.serviceDuration,
    workingDays: STORE_CONFIG.workingDays,
    workHourStart: STORE_CONFIG.workHourStart,
    workHourEnd: STORE_CONFIG.workHourEnd,
    weekStart: STORE_CONFIG.weekStart,
    lunchBreakHour: STORE_CONFIG.lunchBreakHour,
    breakDuration: STORE_CONFIG.breakDuration,
  })

  return schedules.map((dateTime) => ({
    batchId,
    date: dateTime,
    service_id: params.serviceId,
    groomer_id: params.groomerId,
    store_id: params.storeId,
    is_available: true,
  }))
}

console.log(
  generateSlots({
    serviceId: 'svc01',
    serviceDuration: 90,
    groomerId: 'grm01',
    storeId: 'str01',
  }),
)
