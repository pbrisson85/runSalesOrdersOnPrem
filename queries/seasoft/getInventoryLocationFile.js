const { each } = require('lodash')
const { createConnection } = require('../../database/seasoftODBC')
const { setFlag, getFlag } = require('../../queries/postgres/flags')
const logEvent = require('../../queries/postgres/logging')

const getInventoryLocationFile = async catchWeightLines => {
  try {
    const errState = await getFlag('odbcErrorState')
    if (errState) return []

    const odbcConn = await createConnection()

    console.log(`query ODBC for InventoryLocFile ...`)

    let responses = new Set()

    const keys = Object.keys(catchWeightLines)

    for (key of keys) {
      const { lot, loc, lbs, qty, so_num } = catchWeightLines[key]

      const queryString = "SELECT {fn RTRIM(\"Inventory Location File\".ITEM_NUMBER)} AS ITEM_NUMBER, {fn RTRIM(\"Inventory Location File\".LOCATION)} AS LOCATION, {fn RTRIM(\"Inventory Location File\".LOT_NUMBER_OR_SIZE)} AS LOT, \"Inventory Location File\".LAST_COST FROM 'Inventory Location File' WHERE \"Inventory Location File\".ON_HAND_IN_UM <> 0 AND \"Inventory Location File\".LOCATION = ? AND \"Inventory Location File\".LOT_NUMBER_OR_SIZE = ?" //prettier-ignore

      const response = await odbcConn.query(queryString, [loc, lot])

      if (typeof response[0] === 'undefined') console.log('NO INVENTORY FOUND: ', catchWeightLines[key]) // DEBUG ************************

      for (eachResponse of response) {
        responses.add(JSON.stringify({ ...eachResponse, taggedLbs: lbs, taggedQty: qty, so_num })) // Set will allow duplicate objects because they are different refs
      }
    }

    await odbcConn.close()

    const inventoryLocationFile = Array.from(responses)
    // parse the strings
    inventoryLocationFile.forEach((line, i) => {
      inventoryLocationFile[i] = JSON.parse(line)
    })

    return inventoryLocationFile
  } catch (error) {
    console.error(error)

    setFlag('odbcErrorState', true) // set flag to prevent further requests

    await logEvent({
      event_type: 'error',
      funct: 'getInventoryLocationFile',
      reason: error.message,
      note: 'flip odbcErrorState flag',
    })
  }
}

module.exports = getInventoryLocationFile
