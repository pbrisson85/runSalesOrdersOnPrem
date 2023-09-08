const { createConnection } = require('../../database/seasoftODBC')

const getCustomerMaster = async () => {
  try {
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
  }
}

module.exports = getCustomerMaster
