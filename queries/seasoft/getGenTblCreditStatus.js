const { createConnection } = require('../../database/seasoftODBC')
const { setFlag, getFlag } = require('../../queries/postgres/flags')
const logEvent = require('../../queries/postgres/logging')

const getGenTblCreditStatus = async () => {
  try {
    const errState = await getFlag('odbcErrorState')
    if (errState) return []

    const odbcConn = await createConnection()

    console.log(`query ODBC for gen tbl: credit status ...`)

    const queryString = `
      SELECT 
        {fn RTRIM("General Table File".TABLE_CODE)} AS TABLE_CODE, {fn RTRIM("General Table File".TABLE_DESC)} AS TABLE_DESC
      FROM 'General Table File'
      WHERE "General Table File".TABLE_ID = 'STAT'
      
      ` //prettier-ignore

    const response = await odbcConn.query(queryString)

    await odbcConn.close()

    return response
  } catch (error) {
    console.error(error)

    setFlag('odbcErrorState', true) // set flag to prevent further requests

    await logEvent({
      event_type: 'error',
      funct: 'getGenTblCreditStatus',
      reason: error.message,
      note: 'flip odbcErrorState flag',
    })
  }
}

module.exports = getGenTblCreditStatus
