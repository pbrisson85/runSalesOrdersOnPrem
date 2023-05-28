const getSalesOrderlines = require('../queries/seasoft/getSalesOrderLines')
const logEvent = require('../queries/postgres/logging')

const generateSoData = async () => {
  try {
    console.log('hit the generate sales order data function via cron...')

    // Query data
    const salesOrderLines = await getSalesOrderlines()

    // Model Data

    // Map Data

    // Save to DB

    console.log('cron routine complete \n')
    return { msg: 'success', payload: salesOrderLines }
  } catch (error) {
    await logEvent({
      event_type: 'error',
      funct: 'generateSoData',
      reason: error.message,
      note: 'cron job',
    })
  }
}

module.exports = generateSoData
