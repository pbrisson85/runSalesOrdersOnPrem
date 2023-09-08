const getStates = async () => {
  try {
    const { Client } = require('pg')
    const pgClient = new Client() // config from ENV
    await pgClient.connect()

    console.log(`query postgres for states master file ...`)

    const response = await pgClient.query(
      `       
        SELECT 
            TRIM(states.code) AS code
        FROM masters.states
        `
    )

    await pgClient.end()

    return response.rows
  } catch (error) {
    console.error(error)
    return error
  }
}

module.exports = getStates
