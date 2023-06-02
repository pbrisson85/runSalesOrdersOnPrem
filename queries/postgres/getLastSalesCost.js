const logEvent = require('./logging')

const getLastSalesCost = async data => {
  try {
    const { Client } = require('pg')
    const pgClient = new Client() // config from ENV
    await pgClient.connect()

    console.log(`query postgres to get last sales cost ...`)

    let responses = []
    for (line of data) {
      const itemNum = line.line.ITEM_NUMBER
      const response = await pgClient.query(
        'SELECT (sales_line_items.calc_gl_cogs/NULLIF(sales_line_items.calc_gm_rept_weight,0)) AS cost_lb FROM "salesReporting".sales_line_items WHERE sales_line_items.item_number = $1 ORDER BY sales_line_items.formatted_invoice_date DESC LIMIT 1',
        [itemNum]
      )

      responses.push({
        ...line,
        lastSale: {
          costPerLb: typeof response.rows[0] === 'undefined' ? null : response.rows[0].cost_lbs,
          date: typeof response.rows[0] === 'undefined' ? null : response.rows[0].formatted_invoice_date,
        },
      })
    }

    await pgClient.end()

    return responses
  } catch (error) {
    console.log(error)
    await logEvent({
      event_type: 'error',
      funct: 'getLastSalesCost',
      reason: error.message,
      note: 'postgres query error',
    })

    return error
  }
}

module.exports = getLastSalesCost
