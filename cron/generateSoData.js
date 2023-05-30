const getSalesOrderlines = require('../queries/seasoft/getSalesOrderLines')
const getSalesOrderHeader = require('../queries/seasoft/getSalesOrderHeader')
const getCustomerMaster = require('../queries/seasoft/getCustomerMasterFile')
const getSpecialPriceFile = require('../queries/seasoft/getSpecialPriceFile')
const getShipToFile = require('../queries/seasoft/getShipToFile')
const logEvent = require('../queries/postgres/logging')
const unflattenByCompositKey = require('../models/unflattenByCompositKey')
const joinData = require('../models/joinData')
const getCatchWeightLines = require('../queries/seasoft/getCatchWeightLines')
const modelCatchWeights = require('../models/modelCatchWeights')

const generateSoData = async source => {
  try {
    console.log(`hit the generate sales order data function via ${source}...`)

    // Query data
    const salesOrderLines = await getSalesOrderlines()
    const salesOrderHeader = await getSalesOrderHeader()
    const specialPriceFile = await getSpecialPriceFile()
    const customerMaster = await getCustomerMaster()
    const shipToFile = await getShipToFile()
    const catchWeightLines = await getCatchWeightLines(salesOrderLines)

    // THE DIFFICULT PART WILL BE MANUALLY CALCING THE OTHP.

    // Model Data
    const salesOrderHeader_unflat = unflattenByCompositKey(salesOrderHeader, {
      1: 'DOCUMENT_NUMBER',
    })

    const catchWeightLinesModeled = modelCatchWeights(catchWeightLines)
    console.log('test print')
    console.log('catchWeightLinesModeled:', catchWeightLinesModeled)

    // Map Data
    const data = joinData(salesOrderLines, salesOrderHeader_unflat)

    // Save to DB

    console.log('cron routine complete \n')
    return { msg: 'success', catchWeightLinesModeled }
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
