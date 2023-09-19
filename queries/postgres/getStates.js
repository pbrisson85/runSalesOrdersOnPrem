const { pool } = require('../../server')

const getStates = async () => {
  try {
    console.log(`query postgres for states master file ...`)

    const response = await pool.query(
      `       
        SELECT 
            TRIM(states.code) AS code
        FROM masters.states
        `
    )

    return response.rows
  } catch (error) {
    console.error(error)
    return error
  }
}

module.exports = getStates
