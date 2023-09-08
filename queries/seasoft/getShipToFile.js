const { createConnection } = require('../../database/seasoftODBC')

const getShipToFile = async () => {
  try {
    const odbcConn = await createConnection()

    console.log(`query ODBC for ship to file ...`)

    const queryString = `
    
    SELECT 
      {fn RTRIM("Ship-to File".CUSTOMER_CODE)} AS CUSTOMER_CODE, 
      {fn RTRIM("Ship-to File".SHIPTO_CODE)} AS SHIPTO_CODE, 
      {fn RTRIM("Ship-to File".STATE)} AS STATE, 
      {fn RTRIM("Ship-to File".COUNTRY_CODE)} AS COUNTRY_CODE 
    FROM 'Ship-to File' 
    ` //prettier-ignore

    const data = await odbcConn.query(queryString)

    await odbcConn.close()

    return data
  } catch (error) {
    console.error(error)
  }
}

module.exports = getShipToFile
