const logEvent = require('./logging')

const getLastSalesCost = async data => {
  const itemNum = data.line.ITEM_NUMBER

  try {
    const { Client } = require('pg')
    const pgClient = new Client() // config from ENV
    await pgClient.connect()

    const response = await pgClient.query(
      'SELECT (sales_line_items.calc_gl_cogs/sales_line_items.calc_gm_rept_weight) AS cost_lb FROM "salesReporting".sales_line_items WHERE sales_line_items.item_number = $1 ORDER BY sales_line_items.invoice_date DESC LIMIT 1',
      [itemNum]
    )

    await pgClient.end()

    return { ...data, lastSale: { costPerLb: response.rows[0].cost_lbs, date: response.rows[0].formatted_invoice_date } }
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

module.exports = logEvent
