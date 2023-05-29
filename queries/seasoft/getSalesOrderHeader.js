const { createConnection } = require('../../database/seasoftODBC')
const { setFlag, getFlag } = require('../../queries/postgres/flags')
const logEvent = require('../../queries/postgres/logging')

const getSalesOrderHeader = async () => {
  try {
    const errState = await getFlag('odbcErrorState')
    if (errState) return []

    const odbcConn = await createConnection()

    console.log(`query ODBC for sales order header ...`)

    const queryString = "SELECT {fn RTRIM(\"Order Header\".DOCUMENT_NUMBER)} AS DOCUMENT_NUMBER, {fn RTRIM(\"Order Header\".CUSTOMER_CODE)} AS CUSTOMER_CODE, {fn RTRIM(\"Order Header\".CUSTOMER_NAME)} AS CUSTOMER_NAME, \"Order Header\".SCHEDULED_SHIP_DATE, {fn RTRIM(\"Order Header\".CUSTOMER_ORDER_NUMBER)} AS CUSTOMER_ORDER_NUMBER, {fn RTRIM(\"Order Header\".OUTSIDE_SALESPERSON_CODE)} AS OUTSIDE_SALESPERSON_CODE, {fn RTRIM(\"Order Header\".INSIDE_SALESPERSON_CODE)} AS INSIDE_SALESPERSON_CODE, {fn RTRIM(\"Order Header\".TRUCK_ROUTE)} AS TRUCK_ROUTE, {fn RTRIM(\"Order Header\".ENTERD_BY_CODE)} AS ENTERD_BY_CODE, {fn RTRIM(\"Order Header\".CREDIT_STATUS_FLAG)} AS CREDIT_STATUS_FLAG, {fn RTRIM(\"Order Header\".SHIPTO_CODE)} AS SHIPTO_CODE, {fn RTRIM(\"Order Header\".CUSTOMER_TERMS_CODE)} AS CUSTOMER_TERMS_CODE, {fn RTRIM(\"Order Header\".SHIP_METHOD)} AS SHIP_METHOD, {fn RTRIM(\"Order Header\".FOB)} AS FOB, {fn RTRIM(\"Order Header\".CARRIER)} AS CARRIER FROM 'Order Header'" //prettier-ignore

    const response = await odbcConn.query(queryString)

    await odbcConn.close()

    return response
  } catch (error) {
    console.error(error)

    setFlag('odbcErrorState', true) // set flag to prevent further requests

    await logEvent({
      event_type: 'error',
      funct: 'getSalesOrderHeader',
      reason: error.message,
      note: 'flip odbcErrorState flag',
    })
  }
}

module.exports = getSalesOrderHeader
