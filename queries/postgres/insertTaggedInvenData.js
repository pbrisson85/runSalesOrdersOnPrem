const logEvent = require('./logging')

const insertTaggedInventory = async data => {
  try {
    const { Client } = require('pg')
    const pgClient = new Client() // config from ENV
    await pgClient.connect()

    // get versions
    const maxVersion = await pgClient.query('SELECT MAX(version) FROM "salesReporting".tagged_inventory')
    let maxVersionNumber = maxVersion.rows[0].max

    if (maxVersionNumber === null) maxVersionNumber = 0
    console.log('new version number', parseInt(maxVersionNumber) + 1)

    let promises = []
    for (soLine of data) {
      const itemNum = soLine.ITEM_NUMBER
      const location = soLine.LOCATION
      const lot = soLine.LOT
      const qty = soLine.taggedQty
      const weight = soLine.taggedLbs
      const cost = soLine.LAST_COST
      const soNum = soLine.so_num
      const soLineNum = soLine.soLine

      // NEED TO CALC THE COST

      promises.push(
        pgClient.query(
          'INSERT INTO "salesReporting".tagged_inventory (item_num, location, lot, qty, weight, cost, so_num, so_line, timestamp, date_written, version) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT DO NOTHING',
          [itemNum, location, lot, qty, weight, cost, soNum, soLineNum, Date.now(), new Date(), parseInt(maxVersionNumber) + 1]
        )
      )
    }

    const responses = await Promise.all(promises)

    let rowsUpdatedCount = 0
    responses.forEach(res => {
      rowsUpdatedCount += res.rowCount
    })

    console.log(`updated ${rowsUpdatedCount} rows`)

    // delete the oldest version if more than three versions exist
    console.log(`query postgres to delete the tagged inventory ...`)

    const numVersions = await pgClient.query('SELECT DISTINCT(version) AS version FROM "salesReporting".tagged_inventory ORDER BY version ASC')
    const lowestVersion = numVersions.rows[0].version

    if (numVersions.rows.length > 3) {
      const deleteResponse = await pgClient.query(
        'DELETE FROM "salesReporting".tagged_inventory WHERE version = (SELECT MIN(version) FROM "salesReporting".tagged_inventory)'
      )

      console.log(`deleted ${deleteResponse.rowCount} rows of version: ${lowestVersion}`)
    }

    await pgClient.end()

    return rowsUpdatedCount
  } catch (error) {
    console.log(error)

    await logEvent({
      event_type: 'error',
      funct: 'insertTaggedInventory',
      reason: error.message,
      note: 'postgres query error',
    })

    return error
  }
}

module.exports = insertTaggedInventory
