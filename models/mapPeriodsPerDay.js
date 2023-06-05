const mapPeriodsPerDay = periods => {
  console.log('mapping periods per day')

  let mappedPeriods = {}

  periods.forEach(day => {
    const dateArr = day.date.split('/')
    // result: [m,d,yyyy]

    // new Date(y,month index,d, h, m ,s, ms)
    const periodDayDate = new Date(dateArr[2], dateArr[0] - 1, dateArr[1], 0, 0, 0, 0).toLocaleString('en-US', {
      timeZone: 'America/New_York',
    })

    mappedPeriods = {
      ...mappedPeriods,
      [periodDayDate]: {
        week_serial: day.week_serial,
        period_serial: day.period_serial,
        week: day.week,
        period: day.period,
        fiscal_year: day.fiscal_year,
        formattedDate: periodDayDate,
      },
    }
  })

  return mappedPeriods
}

module.exports = mapPeriodsPerDay
