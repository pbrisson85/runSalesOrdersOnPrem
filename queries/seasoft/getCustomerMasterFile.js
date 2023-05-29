const { createConnection } = require('../../database/seasoftODBC')
const { setFlag, getFlag } = require('../../queries/postgres/flags')
const logEvent = require('../../queries/postgres/logging')

const getCustomerMasterFile = async () => {
  try {
    const errState = await getFlag('odbcErrorState')
    if (errState) return []

    const odbcConn = await createConnection()

    console.log(`query ODBC for special price file ...`)

    const queryString = "SELECT {fn RTRIM(\"Customer Master File\".CUSTOMER_CODE)} AS CUSTOMER_CODE, {fn RTRIM(\"Customer Master File\".BROKER)} AS BROKER, {fn RTRIM(\"Customer Master File\".BROKER_2)} AS BROKER_2, {fn RTRIM(\"Customer Master File\".BROKER_3)} AS BROKER_3, {fn RTRIM(\"Customer Master File\".BROKER_4)} AS BROKER_4, {fn RTRIM(\"Customer Master File\".BROKER_5)} AS BROKER_5 FROM 'Customer Master File'" //prettier-ignore

    const response = await odbcConn.query(queryString)

    await odbcConn.close()

    return response
  } catch (error) {
    console.error(error)

    setFlag('odbcErrorState', true) // set flag to prevent further requests

    await logEvent({
      event_type: 'error',
      funct: 'getCustomerMasterFile',
      reason: error.message,
      note: 'flip odbcErrorState flag',
    })
  }
}

module.exports = getCustomerMasterFile
