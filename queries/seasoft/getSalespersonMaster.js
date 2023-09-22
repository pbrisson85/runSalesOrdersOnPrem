const { createConnection } = require('../../database/seasoftODBC')
const { setFlag, getFlag } = require('../../queries/postgres/flags')
const logEvent = require('../../queries/postgres/logging')

const getSalespersonMaster = async () => {
  try {
    const errState = await getFlag('odbcErrorState')
    if (errState) return []

    const odbcConn = await createConnection()

    console.log(`query ODBC for General Table OTHP ...`)

    const queryString = `
        SELECT 
            {fn RTRIM("Salesperson Master".SALESPERSON_CODE)} AS SALESPERSON_CODE, {fn RTRIM("Salesperson Master".NAME)} AS NAME 
        
        FROM 'Salesperson Master' 
       ` //prettier-ignore

    const data = await odbcConn.query(queryString)

    await odbcConn.close()

    return data
  } catch (error) {
    console.error(error)

    setFlag('odbcErrorState', true) // set flag to prevent further requests

    await logEvent({
      event_type: 'error',
      funct: 'getSalespersonMaster',
      reason: error.message,
      note: 'flip odbcErrorState flag',
    })
  }
}

module.exports = getSalespersonMaster
