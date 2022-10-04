function convertTZ(date, tzString) {
  return new Date(
    (typeof date === 'string' ? new Date(date) : date).toLocaleString('en-us', {
      timeZone: tzString,
    }),
  )
}

const formatedDate = (date) => {
  const event = date.toLocaleString('en-GB', { timeZone: 'Asia/Jakarta' })
  return event
}

function myFunction() {
  const expiredDate = new Date('2022-09-26T05:00:00.105Z')
  const localizeExpiredDate = convertTZ(expiredDate, 'Asia/Jakarta')

  const formatDate = formatedDate('2022-09-27T03:24:18.804Z')
  return { localizeExpiredDate, formatDate }
}

console.log(myFunction())
