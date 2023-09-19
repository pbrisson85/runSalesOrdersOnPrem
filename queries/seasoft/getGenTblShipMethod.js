const { createConnection } = require('../../database/seasoftODBC')
const { setFlag, getFlag } = require('../postgres/flags')
const logEvent = require('../postgres/logging')

const getGenTblShipMethod = async () => {
  try {
    const errState = await getFlag('odbcErrorState')
    if (errState) return []

    const odbcConn = await createConnection()

    console.log(`query ODBC for gen tbl: shipp method ...`)

    const queryString = `
      SELECT 
        {fn RTRIM("General Table File".TABLE_CODE)} AS TABLE_CODE, {fn RTRIM("General Table File".TABLE_DESC)} AS TABLE_DESC
      FROM 'General Table File'
      WHERE "General Table File".TABLE_ID = 'SHMD'
      
      ` //prettier-ignore

    const response = await odbcConn.query(queryString)

    await odbcConn.close()

    return response
  } catch (error) {
    console.error(error)

    setFlag('odbcErrorState', true) // set flag to prevent further requests

    await logEvent({
      event_type: 'error',
      funct: 'getGenTblShipMethod',
      reason: error.message,
      note: 'flip odbcErrorState flag',
    })
  }
}

module.exports = getGenTblShipMethod
