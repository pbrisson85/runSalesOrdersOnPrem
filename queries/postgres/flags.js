const logEvent = require('./logging')

const getFlag = async flag_id => {
  try {
    const { Client } = require('pg')
    const pgClient = new Client() // config from ENV
    await pgClient.connect()

    // console.log(`query postgres to GET ${flag_id} busy flag ...`)

    const response = await pgClient.query('SELECT value FROM "salesReporting".flags WHERE id = $1', [flag_id])

    await pgClient.end()

    return response.rows[0].value
  } catch (error) {
    await logEvent({
      event_type: 'error',
      funct: 'getFlag',
      reason: error.message,
      note: 'postgres query error',
    })

    console.log('getFlag error. return as busy ...')
    return true
  }
}

const setFlag = async (flag_id, bool) => {
  try {
    const { Client } = require('pg')
    const pgClient = new Client() // config from ENV
    await pgClient.connect()

    // console.log(`query postgres to SET ${flag_id} busy flag to ${bool} ...`)

    await pgClient.query('UPDATE "salesReporting".flags SET value = $2 WHERE id = $1', [flag_id, bool])

    await pgClient.end()

    return
  } catch (error) {
    await logEvent({
      event_type: 'error',
      funct: 'setFlag',
      reason: error.message,
      note: 'postgres query error',
    })
  }
}

const setAllFlagsFalse = async () => {
  try {
    const { Client } = require('pg')
    const pgClient = new Client() // config from ENV
    await pgClient.connect()

    const response = await pgClient.query('SELECT id FROM "salesReporting".flags')

    let promises = []
    for (flag of response.rows) {
      console.log(`query postgres to SET ${flag.id} to false ...`)
      promises.push(pgClient.query('UPDATE "salesReporting".flags SET value = false WHERE id = $1', [flag.id]))
    }
    const pgResponse = await Promise.all(promises)
    let rowsUpdatedCount = 0

    pgResponse.forEach(res => {
      rowsUpdatedCount += res.rowCount
    })

    console.log(`inserted ${rowsUpdatedCount} rows`)

    await pgClient.end()

    return
  } catch (error) {
    await logEvent({
      event_type: 'error',
      funct: 'setAllFlagsFalse',
      reason: error.message,
      note: 'postgres query error',
    })

    return error
  }
}

module.exports.getFlag = getFlag
module.exports.setFlag = setFlag
module.exports.setAllFlagsFalse = setAllFlagsFalse
