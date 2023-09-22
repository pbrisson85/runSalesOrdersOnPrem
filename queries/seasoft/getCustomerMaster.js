const { createConnection } = require('../../database/seasoftODBC')
const { setFlag, getFlag } = require('../../queries/postgres/flags')
const logEvent = require('../../queries/postgres/logging')

const getCustomerMaster = async () => {
  try {
    const errState = await getFlag('odbcErrorState')
    if (errState) return []

    const odbcConn = await createConnection()

    console.log(`query ODBC for customer master file ...`)

    const queryString = `
    
    SELECT 
      {fn RTRIM("Customer Master File".CUSTOMER_CODE)} AS CUSTOMER_CODE, 
      {fn RTRIM("Customer Master File".STATE)} AS STATE, 
      {fn RTRIM("Customer Master File".COUNTRY_CODE)} AS COUNTRY_CODE
    FROM 'Customer Master File' 
    ` //prettier-ignore

    const data = await odbcConn.query(queryString)

    await odbcConn.close()

    return data
  } catch (error) {
    console.error(error)

    setFlag('odbcErrorState', true) // set flag to prevent further requests

    await logEvent({
      event_type: 'error',
      funct: 'getCustomerMaster',
      reason: error.message,
      note: 'flip odbcErrorState flag',
    })
  }
}

module.exports = getCustomerMaster
