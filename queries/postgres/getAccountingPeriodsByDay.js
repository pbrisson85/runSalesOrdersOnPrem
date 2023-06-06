const getAccountingPeriodsByDay = async soDateRange => {
  const { Client } = require('pg')
  const pgClient = new Client() // config from ENV
  await pgClient.connect()

  console.log(
    `query postgres for accounting periods by day for dates: ${new Date(soDateRange.firstDate)} through ${new Date(soDateRange.lastDate)} ...`
  )

  const periodsByDay = await pgClient.query(
    'SELECT period_by_day.date, period_by_day.period, period_by_day.week, period_by_day.week_serial, period_by_day.period_serial, period_by_day.fiscal_year FROM "accountingPeriods".period_by_day WHERE period_by_day.date >= $1 AND period_by_day.date <= $2',
    [new Date(soDateRange.firstDate), new Date(soDateRange.lastDate)]
  )

  await pgClient.end()

  return periodsByDay.rows
}

module.exports = getAccountingPeriodsByDay
