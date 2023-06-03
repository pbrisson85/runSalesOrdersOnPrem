const { createConnection } = require('../../database/seasoftODBC')
const { setFlag, getFlag } = require('../../queries/postgres/flags')
const logEvent = require('../../queries/postgres/logging')

const getOthpTable = async () => {
  try {
    const errState = await getFlag('odbcErrorState')
    if (errState) return []

    const odbcConn = await createConnection()

    console.log(`query ODBC for sales General Table ...`)

    const queryString = "SELECT {fn RTRIM(\"General Table\".TABLE_CODE)} AS OTHP_CODE, {fn RTRIM(\"General Table\".TABLE_FLD02)} AS CONTRA FROM 'General Table' WHERE \"General Table\".TABLE_ID = 'OTHP' " //prettier-ignore

    const response = await odbcConn.query(queryString)

    await odbcConn.close()

    return response
  } catch (error) {
    console.error(error)

    setFlag('odbcErrorState', true) // set flag to prevent further requests

    await logEvent({
      event_type: 'error',
      funct: 'getOthpTable',
      reason: error.message,
      note: 'flip odbcErrorState flag',
    })
  }
}

module.exports = getOthpTable
