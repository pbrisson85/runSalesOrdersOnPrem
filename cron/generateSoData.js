const getSalesOrderlines = require('../queries/seasoft/getSalesOrderLines')
const getSalesOrderHeader = require('../queries/seasoft/getSalesOrderHeader')
const getCustomerMaster = require('../queries/seasoft/getCustomerMasterFile')
const getSpecialPriceFile = require('../queries/seasoft/getSpecialPriceFile')
const getShipToFile = require('../queries/seasoft/getShipToFile')
const logEvent = require('../queries/postgres/logging')
const getCatchWeightLines = require('../queries/seasoft/getCatchWeightLines')
const getNonLotCostedItems = require('../queries/seasoft/getNonLotCostedItems')
const getInventoryLocationFile = require('../queries/seasoft/getInventoryLocationFile')

const unflattenByCompositKey = require('../models/unflattenByCompositKey')
const modelCatchWeights = require('../models/modelCatchWeights')
const joinData = require('../models/joinData')

const generateSoData = async source => {
  // build this out so that all sales order data is accessible through postgres (sales order table and an OTHP table for the sales order lines)

  try {
    console.log(`hit the generate sales order data function via ${source}...`)

    // Query data
    const salesOrderLines = await getSalesOrderlines()
    const salesOrderHeader = await getSalesOrderHeader()
    const specialPriceFile = await getSpecialPriceFile()
    const customerMaster = await getCustomerMaster()
    const shipToFile = await getShipToFile()
    const catchWeightLines = await getCatchWeightLines(salesOrderLines)
    const nonLotCostedItems = await getNonLotCostedItems() // to test against billed_weight = 0 because if item is not lot costed then the billed weight will not be 0 ever.

    // THE DIFFICULT PART WILL BE MANUALLY CALCING THE OTHP.

    // Model Data
    const mappedNonLotCostedItems = nonLotCostedItems.map(item => item.ITEM_NUMBER)
    const salesOrderHeader_unflat = unflattenByCompositKey(salesOrderHeader, {
      1: 'DOCUMENT_NUMBER',
    })
    const catchWeightLinesModeled = modelCatchWeights(catchWeightLines)

    // Use catch weight lines lot and location to find array of possible items:
    const taggedInventory = await getInventoryLocationFile(catchWeightLinesModeled)
    const taggedInventory_unflat = unflattenByCompositKey(taggedInventory, {
      1: 'so_num',
      2: 'ITEM_NUMBER',
      3: 'LOCATION',
    })

    // Map Data
    //const data = joinData(salesOrderLines, salesOrderHeader_unflat, taggedInventory_unflat, mappedNonLotCostedItems)
    // still need average cost of inventory *********************************************************

    // Save to DB

    console.log('cron routine complete \n')
    return { msg: 'success', taggedInventory_unflat, catchWeightLinesModeled }
  } catch (error) {
    console.error(error)

    await logEvent({
      event_type: 'error',
      funct: 'generateSoData',
      reason: error.message,
      note: 'cron job',
    })
  }
}

module.exports = generateSoData
