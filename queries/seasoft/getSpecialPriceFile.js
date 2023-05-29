const { createConnection } = require('../../database/seasoftODBC')
const { setFlag, getFlag } = require('../../queries/postgres/flags')
const logEvent = require('../../queries/postgres/logging')

const getSpecialPriceFile = async () => {
  try {
    const errState = await getFlag('odbcErrorState')
    if (errState) return []

    const odbcConn = await createConnection()

    console.log(`query ODBC for special price file ...`)

    const queryString = "SELECT {fn RTRIM(\"Special Price File\".CUSTOMER_CODE)} AS CUSTOMER_CODE, {fn RTRIM(\"Special Price File\".ITEM_NUMBER)} AS ITEM_NUMBER, {fn RTRIM(\"Special Price File\".OTHER_PRICE_CODE)} AS OTHER_PRICE_CODE, \"Special Price File\".OTHER_PRICE, {fn RTRIM(\"Special Price File\".ITEM_ATTRIBUTES)} AS ITEM_ATTRIBUTES, \"Special Price File\".EFFECTIVE_DATE, \"Special Price File\".EXPIRATION_DATE, {fn RTRIM(\"Special Price File\".BROKER)} AS BROKER, {fn RTRIM(\"Special Price File\".SHIP_VIA_CODE)} AS SHIP_VIA_CODE, {fn RTRIM(\"Special Price File\".TRUCK_ROUTE)} AS TRUCK_ROUTE, {fn RTRIM(\"Special Price File\".FREIGHT_TYPE)} AS FREIGHT_TYPE, {fn RTRIM(\"Special Price File\".CARRIER_CODE)} AS CARRIER_CODE FROM 'Special Price File'" //prettier-ignore

    const response = await odbcConn.query(queryString)

    await odbcConn.close()

    return response
  } catch (error) {
    console.error(error)

    setFlag('odbcErrorState', true) // set flag to prevent further requests

    await logEvent({
      event_type: 'error',
      funct: 'getSpecialPriceFile',
      reason: error.message,
      note: 'flip odbcErrorState flag',
    })
  }
}

module.exports = getSpecialPriceFile
