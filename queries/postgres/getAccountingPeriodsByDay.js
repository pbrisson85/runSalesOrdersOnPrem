const { pool } = require('../../server')

const getAccountingPeriodsByDay = async soDateRange => {
  console.log(`query postgres for accounting periods by day for dates: ${soDateRange.firstDate} through ${soDateRange.lastDate} ...`)

  const periodsByDay = await pool.query(
    'SELECT period_by_day.date, period_by_day.period, period_by_day.week, period_by_day.week_serial, period_by_day.period_serial, period_by_day.fiscal_year FROM "accountingPeriods".period_by_day WHERE period_by_day.formatted_date >= $1 AND period_by_day.formatted_date <= $2',
    [soDateRange.firstDate, soDateRange.lastDate]
  )

  return periodsByDay.rows
}

module.exports = getAccountingPeriodsByDay
