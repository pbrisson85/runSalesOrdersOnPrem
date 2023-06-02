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
const assignCatchWeightLine = require('../models/assignCatchWeightLine')

const generateSoData = async source => {
  // build this out so that all sales order data is accessible through postgres (sales order table and an OTHP table for the sales order lines)

  try {
    console.log(`hit the generate sales order data function via ${source}...`)

    // Pull a SO line, determine if tagged or not. If tagged, need to know how many lines are tagged and what ordered number of tagged lines you are working with BECAUSE that is the only way to match up to the lot from the catch weight table. They are the same "tagged line number"

    // Query data
    const salesOrderHeader = await getSalesOrderHeader()
    const specialPriceFile = await getSpecialPriceFile()
    const customerMaster = await getCustomerMaster()
    const shipToFile = await getShipToFile()
    let nonLotCostedItems = await getNonLotCostedItems() // if item is not lot costed then weight will be in the billed weight (tagged weight) col.
    nonLotCostedItems = nonLotCostedItems.map(item => item.ITEM_NUMBER)
    let salesOrderLines = await getSalesOrderlines()

    // assign a "tagged line number" to each line. This will be used to match up to the catch weight lines.
    salesOrderLines = assignCatchWeightLine(salesOrderLines, nonLotCostedItems)

    const catchWeightLines = await getCatchWeightLines(salesOrderLines) // adds sales order line number by using the tagged line number

    // Model Data
    const salesOrderHeader_unflat = unflattenByCompositKey(salesOrderHeader, {
      1: 'DOCUMENT_NUMBER',
    })
    const salesOrderLines_unflat = unflattenByCompositKey(salesOrderLines, {
      1: 'ORDER_NUMBER',
      2: 'LINE_NUMBER',
    })
    const catchWeightLinesModeled = modelCatchWeights(catchWeightLines)

    return catchWeightLinesModeled

    // Use catch weight lines lot and location to find array of possible items:
    const taggedInventory = await getInventoryLocationFile(catchWeightLinesModeled, salesOrderLines_unflat) // should be able to use the soLine to get the item and only pull the actual lot
    const taggedInventory_unflat = unflattenByCompositKey(taggedInventory, {
      1: 'so_num',
      2: 'ITEM_NUMBER',
      3: 'LOCATION',
    })

    // NEED TO RUN THROUG THIS TO SEE IF THE OUTPUT OF EACH FUNCTION IS WHAT I EXPECT. HITTING AN ERROR

    // Map Data
    //const data = joinData(salesOrderLines, salesOrderHeader_unflat, taggedInventory_unflat, mappedNonLotCostedItems)
    // still need average cost of inventory *********************************************************

    // Save to DB

    // THE DIFFICULT PART WILL BE MANUALLY CALCING THE OTHP. ****************************************

    console.log('cron routine complete \n')
    return { msg: 'success', taggedInventory_unflat, catchWeightLinesModeled, catchWeightLines }
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
