const { createConnection } = require('../../database/seasoftODBC')

const getSalespersonMaster = async () => {
  try {
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
  }
}

module.exports = getSalespersonMaster
