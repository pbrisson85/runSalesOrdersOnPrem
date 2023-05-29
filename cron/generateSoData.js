const getSalesOrderlines = require('../queries/seasoft/getSalesOrderLines')
const getSalesOrderHeader = require('../queries/seasoft/getSalesOrderHeader')
const getCustomerMaster = require('../queries/seasoft/getCustomerMasterFile')
const getSpecialPriceFile = require('../queries/seasoft/getSpecialPriceFile')
const getShipToFile = require('../queries/seasoft/getShipToFile')
const logEvent = require('../queries/postgres/logging')

const generateSoData = async () => {
  try {
    console.log('hit the generate sales order data function via cron...')

    // Query data
    const salesOrderLines = await getSalesOrderlines()
    const salesOrderHeader = await getSalesOrderHeader()
    const specialPriceFile = await getSpecialPriceFile()
    const customerMaster = await getCustomerMaster()
    const shipToFile = await getShipToFile()

    // Model Data

    // Map Data

    // Save to DB

    console.log('cron routine complete \n')
    return { msg: 'success', payload: { shipToFile, customerMaster, specialPriceFile, salesOrderHeader, salesOrderLines } }
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
