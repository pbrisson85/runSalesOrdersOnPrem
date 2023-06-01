const { createConnection } = require('../../database/seasoftODBC')
const { setFlag, getFlag } = require('../../queries/postgres/flags')
const logEvent = require('../../queries/postgres/logging')

const getCatchWeightLines = async orders => {
  try {
    const errState = await getFlag('odbcErrorState')
    if (errState) return []

    const odbcConn = await createConnection()

    console.log(`query ODBC for Catch Weight Lines ...`)

    let responses = []

    for (eachOrderLine of orders) {
      const { ORDER_NUMBER, LOCATION, taggedLineNum, isTagged, LINE_NUMBER } = eachOrderLine
      if (!isTagged) continue

      const loc_search = `%${LOCATION}%`

      const queryString = "SELECT {fn RTRIM(\"Catch Weight Lines\".DOCUMENT_LINE_KEY)} AS so_num, \"Catch Weight Lines\".WEIGHT_REC AS tagged_array, \"Catch Weight Lines\".QTY_COMMITTED AS qty_committed, \"Catch Weight Lines\".LOCATION_REC AS location_array FROM 'Catch Weight Lines' WHERE \"Catch Weight Lines\".DOCUMENT_LINE_KEY = ? and LOCATION_REC LIKE ?" //prettier-ignore

      const response = await odbcConn.query(queryString, [ORDER_NUMBER, loc_search])

      responses.push({ ...response[taggedLineNum], soLine: LINE_NUMBER })
    }

    await odbcConn.close()

    return responses
  } catch (error) {
    console.error(error)

    setFlag('odbcErrorState', true) // set flag to prevent further requests

    await logEvent({
      event_type: 'error',
      funct: 'getCatchWeightLines',
      reason: error.message,
      note: 'flip odbcErrorState flag',
    })
  }
}

module.exports = getCatchWeightLines
