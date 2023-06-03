const logEvent = require('./logging')

const getOthpDefinitions = async () => {
  try {
    const { Client } = require('pg')
    const pgClient = new Client() // config from ENV
    await pgClient.connect()

    console.log(`query postgres to GET othp definitions ...`)

    const response = await pgClient.query(
      'SELECT othp_definitions.contra, othp_definitions.category, othp_definitions.ignore FROM "salesReporting".othp_definitions'
    )

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
