const getSalesOrderlines = require('../queries/seasoft/getSalesOrderLines')
const getSalesOrderHeader = require('../queries/seasoft/getSalesOrderHeader')
const getCatchWeightLines = require('../queries/seasoft/getCatchWeightLines')
const getNonLotCostedItems = require('../queries/seasoft/getNonLotCostedItems')
const getOthpTable = require('../queries/seasoft/getOthpTable')
const { getLotCosts, getAverageCosts } = require('../queries/seasoft/getInventoryLocationFile')
const logEvent = require('../queries/postgres/logging')
const getLastSalesCost = require('../queries/postgres/getLastSalesCost')
const getOthpDefinitions = require('../queries/postgres/getOthpDefinitions')
const unflattenByCompositeKey = require('../models/unflattenByCompositeKey')
const modelCatchWeights = require('../models/modelCatchWeights')
const joinData = require('../models/joinData')
const assignCatchWeightLine = require('../models/assignCatchWeightLine')
const calcOthp = require('../models/calcOthp')
const calcCost = require('../models/calcCost')
const insertSoData = require('../queries/postgres/insertSoData')
const getPeriodsByDay = require('../queries/postgres/getAccountingPeriodsByDay')
const getSoDateRange = require('../models/getSoDateRange')
const mapPeriodsPerDay = require('../models/mapPeriodsPerDay')
const insertTaggedInventory = require('../queries/postgres/insertTaggedInvenData')
const getSalespersonMaster = require('../queries/seasoft/getSalespersonMaster')
const cleanStates = require('../models/cleanStates')
const getShipToFile = require('../queries/seasoft/getShipToFile')
const getCustomerMaster = require('../queries/seasoft/getCustomerMaster')
const getStates = require('../queries/postgres/getStates')
const getGenTblCreditStatus = require('../queries/seasoft/getGenTblCreditStatus')

const generateSoData = async source => {
  try {
    console.log(`hit the generate sales order data function via ${source}...`)

    /* Query data */
    const othpDefinitions = await getOthpDefinitions()
    const othpTable = await getOthpTable()
    const lastSalesCost = await getLastSalesCost()
    let salesOrderHeader = await getSalesOrderHeader()
    const soDateRange = getSoDateRange(salesOrderHeader) // get date range from sales order header
    let nonLotCostedItems = await getNonLotCostedItems() // if item is not lot costed then weight will be in the billed weight (tagged weight) col.
    nonLotCostedItems = nonLotCostedItems.map(item => item.ITEM_NUMBER)
    let salesOrderLines = await getSalesOrderlines()
    const periodsByDay = await getPeriodsByDay(soDateRange)
    const salespersonMaster = await getSalespersonMaster()

    salesOrderLines = assignCatchWeightLine(salesOrderLines, nonLotCostedItems) // assign a "tagged line number" to each line. This will be used to match up to the catch weight lines.
    const catchWeightLines = await getCatchWeightLines(salesOrderLines) // adds sales order line number by using the tagged line number

    const shipToFile = await getShipToFile()
    const customerMaster = await getCustomerMaster()
    const states = await getStates()
    const genTblCreditStatus = await getGenTblCreditStatus()

    /* Model Data */
    salesOrderHeader = cleanStates(states, salesOrderHeader)

    const mappedPeriods = mapPeriodsPerDay(periodsByDay)
    const othpTable_unflat = unflattenByCompositeKey(othpTable, {
      1: 'OTHP_CODE',
    })
    const othpDefinitions_unflat = unflattenByCompositeKey(othpDefinitions, {
      1: 'contra',
    })
    const salesOrderHeader_unflat = unflattenByCompositeKey(salesOrderHeader, {
      1: 'DOCUMENT_NUMBER',
    })
    const salesOrderLines_unflat = unflattenByCompositeKey(salesOrderLines, {
      1: 'ORDER_NUMBER',
      2: 'LINE_NUMBER',
    })
    const lastSalesCost_unflat = unflattenByCompositeKey(lastSalesCost, {
      1: 'item_number',
    })
    const othpCalc = calcOthp(salesOrderLines, othpTable_unflat, othpDefinitions_unflat)
    const othpCalc_unflat = unflattenByCompositeKey(othpCalc, {
      1: 'ORDER_NUMBER',
      2: 'LINE_NUMBER',
    })

    const catchWeightLinesModeled = modelCatchWeights(catchWeightLines) // flattens the catch weight lines and adds the sales order line number to the catch weight line key is soNum-LineNum-lotNum-Loc.
    // Use catch weight lines lot and location, along with sales order line itemNum to find The inventory cost:
    const taggedInventory = await getLotCosts(catchWeightLinesModeled, salesOrderLines_unflat)
    const taggedInventory_unflat = unflattenByCompositeKey(taggedInventory, {
      1: 'so_num',
      2: 'soLine',
    })

    const salespersonMaster_unflat = unflattenByCompositeKey(salespersonMaster, {
      1: 'SALESPERSON_CODE',
    })

    const shipToFile_unflat = unflattenByCompositeKey(shipToFile, {
      1: 'CUSTOMER_CODE',
      2: 'SHIPTO_CODE',
    })
    const customerMaster_unflat = unflattenByCompositeKey(customerMaster, {
      1: 'CUSTOMER_CODE',
    })
    const genTblCreditStatus_unflat = unflattenByCompositeKey(genTblCreditStatus, {
      1: 'TABLE_CODE',
    })

    /* Map Data */
    let data = joinData(
      salesOrderLines,
      salesOrderHeader_unflat,
      taggedInventory_unflat,
      lastSalesCost_unflat,
      othpCalc_unflat,
      mappedPeriods,
      salespersonMaster_unflat,
      shipToFile_unflat,
      customerMaster_unflat,
      genTblCreditStatus_unflat
    )

    // Add inventory average lot cost to each untagged line
    data = await getAverageCosts(data)

    // Add cost to each line
    data = calcCost(data)

    // Save to DB
    await insertSoData(data)
    await insertTaggedInventory(taggedInventory)

    // TESTS
    // Reconcile tagged weight: The sume of taggedLots.taggedLbs === line.TAGGED_WEIGHT
    // STILL NEED A SUB TABLE FOR EACH OTHP LINE ***

    console.log('cron routine complete \n')
    return { msg: 'success', data }
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
