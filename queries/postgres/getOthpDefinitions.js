const logEvent = require('./logging')
const { pool } = require('../../server')

const getOthpDefinitions = async () => {
  try {
    console.log(`query postgres to GET othp definitions ...`)

    const response = await pool.query('SELECT t.contra, t.category FROM "salesReporting".contra_sales_gl_map AS t')

    return response.rows
  } catch (error) {
    await logEvent({
      event_type: 'error',
      funct: 'getOthpDefinitions',
      reason: error.message,
      note: 'postgres query error',
    })

    console.error(error)
    return true
  }
}

module.exports = getOthpDefinitions
