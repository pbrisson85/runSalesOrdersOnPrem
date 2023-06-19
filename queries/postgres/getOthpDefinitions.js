const logEvent = require('./logging')

const getOthpDefinitions = async () => {
  try {
    const { Client } = require('pg')
    const pgClient = new Client() // config from ENV
    await pgClient.connect()

    console.log(`query postgres to GET othp definitions ...`)

    const response = await pgClient.query('SELECT t.contra, t.category FROM "salesReporting".contra_sales_gl_map AS t')

    await pgClient.end()

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
