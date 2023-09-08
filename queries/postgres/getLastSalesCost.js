const logEvent = require('./logging')

const getLastSalesCost = async () => {
  try {
    const { Client } = require('pg')
    const pgClient = new Client() // config from ENV
    await pgClient.connect()

    console.log(`query postgres to get last sales cost for all items ...`)

    const response = await pgClient.query(
      `SELECT 
        t.item_number, 
        t.formatted_invoice_date, 
        t.cogs_ext_gl/NULLIF(t.calc_gm_rept_weight,0) AS cost_lb 
      FROM (
        SELECT 
          sales_line_items.item_number, 
          sales_line_items.formatted_invoice_date, 
          sales_line_items.cogs_ext_gl, 
          sales_line_items.calc_gm_rept_weight, 
          row_number() OVER (PARTITION BY sales_line_items.item_number ORDER BY sales_line_items.formatted_invoice_date DESC) 
            AS seqnum 
        FROM "salesReporting".sales_line_items 
        WHERE invoice_number NOT LIKE \'%C\') 
          AS t 
      WHERE seqnum = 1`
    )

    await pgClient.end()

    return response.rows
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
