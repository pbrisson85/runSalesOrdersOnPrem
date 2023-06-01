const { createConnection } = require('../../database/seasoftODBC')
const { setFlag, getFlag } = require('../../queries/postgres/flags')
const logEvent = require('../../queries/postgres/logging')

const getNonLotCostedItems = async (req, res) => {
  try {
    const errState = await getFlag('odbcErrorState')
    if (errState) return []

    const odbcConn = await createConnection()

    console.log(`query ODBC for special price file ...`)

    const queryString = "SELECT {fn RTRIM(\"Customer Master File\".ITEM_NUMBER)} AS ITEM_NUMBER FROM 'Inventory Master File' WHERE NOT (\"Customer Master File\".LOT_CONTROL_ITEM = 'Y' AND \"Customer Master File\".USE_LOT_COST = 'Y')" //prettier-ignore

    const response = await odbcConn.query(queryString)

    await odbcConn.close()

    return response
  } catch (error) {
    console.error(error)

    setFlag('odbcErrorState', true) // set flag to prevent further requests

    await logEvent({
      event_type: 'error',
      funct: 'getNonLotCostedItems',
      reason: error.message,
      note: 'flip odbcErrorState flag',
    })
  }
}

module.exports = getNonLotCostedItems
