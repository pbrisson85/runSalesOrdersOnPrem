const { v4: uuidv4 } = require('uuid')
const { pool } = require('../../server')

const logEvent = async event => {
  try {
    const { event_type, funct, reason, note } = event

    const app = 'runSalesOrdersOnPrem'
    const uuid = uuidv4()
    const timestamp = Date.now()
    const write_date = new Date()

    const response = await pool.query(
      'INSERT INTO logging.logging (uuid, timestamp, write_date, app, event_type, function, reason, note) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING',
      [uuid, timestamp, write_date, app, event_type, funct, reason, note]
    )

    return
  } catch (error) {
    console.log(error)
    return error
  }
}

module.exports = logEvent
