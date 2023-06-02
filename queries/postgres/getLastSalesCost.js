const logEvent = require('./logging')

const getLastSalesCost = async () => {
  try {
    const { Client } = require('pg')
    const pgClient = new Client() // config from ENV
    await pgClient.connect()

    console.log(`query postgres to get last sales cost for all items ...`)

    const response = await pgClient.query(
      'SELECT t.item_number, t.formatted_invoice_date, t.calc_gl_cogs/NULLIF(t.calc_gm_rept_weight,0) AS cost_lb FROM (SELECT sales_line_items.item_number, sales_line_items.formatted_invoice_date, sales_line_items.calc_gl_cogs, sales_line_items.calc_gm_rept_weight, row_number() OVER (PARTITION BY sales_line_items.item_number ORDER BY sales_line_items.formatted_invoice_date DESC) AS seqnum FROM "salesReporting".sales_line_items) AS t WHERE seqnum = 1'
    )

    await pgClient.end()

    let returnVal
    if (response.rows.length > 0) {
      returnVal = response.rows
    } else {
      returnVal = [{ item_number: null, formatted_invoice_date: null, cost_lb: null }]
    }

    return returnVal
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
