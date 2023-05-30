const { createConnection } = require('../../database/seasoftODBC')
const { setFlag, getFlag } = require('../../queries/postgres/flags')
const logEvent = require('../../queries/postgres/logging')

const getShipToFile = async () => {
  try {
    const errState = await getFlag('odbcErrorState')
    if (errState) return []

    const odbcConn = await createConnection()

    console.log(`query ODBC for special price file ...`)

    const queryString = "SELECT {fn RTRIM(\"Ship-to File\".CUSTOMER_CODE)} AS CUSTOMER_CODE, {fn RTRIM(\"Ship-to File\".SHIPTO_CODE)} AS SHIPTO_CODE, {fn RTRIM(\"Ship-to File\".BROKER)} AS BROKER FROM 'Ship-to File'" //prettier-ignore

    const response = await odbcConn.query(queryString)

    await odbcConn.close()

    return response
  } catch (error) {
    console.error(error)

    setFlag('odbcErrorState', true) // set flag to prevent further requests

    await logEvent({
      event_type: 'error',
      funct: 'getShipToFile',
      reason: error.message,
      note: 'flip odbcErrorState flag',
    })
  }
}

module.exports = getShipToFile