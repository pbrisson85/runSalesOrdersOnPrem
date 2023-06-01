const { createConnection } = require('../../database/seasoftODBC')
const { setFlag, getFlag } = require('../../queries/postgres/flags')
const logEvent = require('../../queries/postgres/logging')

const getInventoryLocationFile = async catchWeightLines => {
  try {
    const errState = await getFlag('odbcErrorState')
    if (errState) return []

    const odbcConn = await createConnection()

    console.log(`query ODBC for InventoryLocFile ...`)

    let responses = []

    const keys = Object.keys(catchWeightLines)

    for (key of keys) {
      const { lot, loc } = catchWeightLines[key]

      const queryString = "SELECT {fn RTRIM(\"Inventory Location File\".ITEM_NUMBER)} AS ITEM_NUMBER, {fn RTRIM(\"Inventory Location File\".LOCATION)} AS LOCATION, {fn RTRIM(\"Inventory Location File\".LOT_NUMBER_OR_SIZE)} AS LOT_NUMBER_OR_SIZE, \"Inventory Location File\".LAST_COST FROM 'Inventory Location File' WHERE \"Inventory Location File\".ON_HAND_IN_UM <> 0 AND \"Inventory Location File\".LOCATION = ? AND \"Inventory Location File\".LOT_NUMBER_OR_SIZE = ?" //prettier-ignore

      const response = await odbcConn.query(queryString, [loc, lot])

      if (typeof response[0] === 'undefined') console.log('NO INVENTORY FOUND: ', catchWeightLines[key]) // DEBUG ************************

      responses.push(response[0])
    }

    await odbcConn.close()

    return responses
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