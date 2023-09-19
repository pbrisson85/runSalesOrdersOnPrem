const logEvent = require('./logging')
const { pool } = require('../../server')

const getFlag = async flag_id => {
  try {
    // console.log(`query postgres to GET ${flag_id} busy flag ...`)

    const response = await pool.query('SELECT value FROM "salesReporting".flags WHERE id = $1', [flag_id])

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
    // console.log(`query postgres to SET ${flag_id} busy flag to ${bool} ...`)

    await pool.query('UPDATE "salesReporting".flags SET value = $2 WHERE id = $1', [flag_id, bool])

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
    const response = await pool.query('SELECT id FROM "salesReporting".flags')

    let promises = []
    for (flag of response.rows) {
      console.log(`query postgres to SET ${flag.id} to false ...`)
      promises.push(pool.query('UPDATE "salesReporting".flags SET value = false WHERE id = $1', [flag.id]))
    }
    const pgResponse = await Promise.all(promises)
    let rowsUpdatedCount = 0

    pgResponse.forEach(res => {
      rowsUpdatedCount += res.rowCount
    })

    console.log(`inserted ${rowsUpdatedCount} rows`)

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
