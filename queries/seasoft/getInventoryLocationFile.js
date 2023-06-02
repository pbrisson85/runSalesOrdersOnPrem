const { createConnection } = require('../../database/seasoftODBC')
const { setFlag, getFlag } = require('../../queries/postgres/flags')
const logEvent = require('../../queries/postgres/logging')

const getLotCosts = async (catchWeightLines, salesOrderLines_unflat) => {
  try {
    const errState = await getFlag('odbcErrorState')
    if (errState) return []

    const odbcConn = await createConnection()

    console.log(`query ODBC for InventoryLocFile for each lot cost ...`)

    let responses = []

    const keys = Object.keys(catchWeightLines)

    for (key of keys) {
      const { lot, loc, lbs, qty, so_num, soLine } = catchWeightLines[key]
      const item = salesOrderLines_unflat[`${so_num}-${soLine}`][0].ITEM_NUMBER

      const queryString = "SELECT {fn RTRIM(\"Inventory Location File\".ITEM_NUMBER)} AS ITEM_NUMBER, {fn RTRIM(\"Inventory Location File\".LOCATION)} AS LOCATION, {fn RTRIM(\"Inventory Location File\".LOT_NUMBER_OR_SIZE)} AS LOT, \"Inventory Location File\".LAST_COST FROM 'Inventory Location File' WHERE \"Inventory Location File\".ON_HAND_IN_UM <> 0 AND \"Inventory Location File\".LOCATION = ? AND \"Inventory Location File\".LOT_NUMBER_OR_SIZE = ? AND \"Inventory Location File\".ITEM_NUMBER = ?" //prettier-ignore

      const response = await odbcConn.query(queryString, [loc, lot, item])

      if (typeof response[0] === 'undefined') console.log('NO INVENTORY FOUND: ', catchWeightLines[key], item) // DEBUG ************************

      // Note that multiple items can be tagged to the same lot and location. They appear to be in the same order as the sales order lines

      responses.push({ ...response[0], taggedLbs: lbs, taggedQty: qty, so_num, soLine })
    }

    await odbcConn.close()

    return responses
  } catch (error) {
    console.error(error)

    setFlag('odbcErrorState', true) // set flag to prevent further requests

    await logEvent({
      event_type: 'error',
      funct: 'getInventoryLocationFile',
      reason: error.message,
      note: 'flip odbcErrorState flag',
    })
  }
}

const getAverageCosts = async data => {
  try {
    const errState = await getFlag('odbcErrorState')
    if (errState) return []

    const odbcConn = await createConnection()

    console.log(`query ODBC for InventoryLocFile for ave inventory cost ...`)

    let responses = []

    for (line of data) {
      const queryString_1 = "SELECT {fn RTRIM(\"Inventory Location File\".ITEM_NUMBER)} AS ITEM_NUMBER, SUM(\"Inventory Location File\".ON_HAND_IN_UM * \"Inventory Location File\".LOT_AVERAGE_WEIGHT) AS lbs_on_hand, SUM(\"Inventory Location File\".ON_HAND_IN_UM * \"Inventory Location File\".LOT_AVERAGE_WEIGHT * \"Inventory Location File\".LAST_COST) AS cost_on_hand FROM 'Inventory Location File' WHERE \"Inventory Location File\".ON_HAND_IN_UM <> 0 AND \"Inventory Location File\".ITEM_NUMBER = ? GROUP BY \"Inventory Location File\".ITEM_NUMBER" //prettier-ignore

      const aveCostResponse = await odbcConn.query(queryString_1, [line.line.ITEM_NUMBER])

      const queryString_2 = "SELECT {fn RTRIM(\"Inventory Location File\".ITEM_NUMBER)} AS ITEM_NUMBER, \"Inventory Location File\".LAST_COST, \"Inventory Location File\".LAST_WITHDRAWAL_DATE FROM 'Inventory Location File' WHERE \"Inventory Location File\".LAST_WITHDRAWAL_DATE IN (SELECT MAX(\"Inventory Location File\".LAST_WITHDRAWAL_DATE) FROM 'Inventory Location File' WHERE \"Inventory Location File\".ITEM_NUMBER = ? AND \"Inventory Location File\".LAST_COST > 0 AND \"Inventory Location File\".LAST_COST IS NOT NULL) AND \"Inventory Location File\".ITEM_NUMBER = ?" //prettier-ignore

      const lastCostResponse = await odbcConn.query(queryString_2, [line.line.ITEM_NUMBER, line.line.ITEM_NUMBER])

      // Note that multiple items can be tagged to the same lot and location. They appear to be in the same order as the sales order lines

      responses.push({
        ...line,
        inventory: {
          costOnHand: aveCostResponse[0]?.cost_on_hand,
          lbsOnHand: aveCostResponse[0]?.lbs_on_hand,
          aveOnHandCostPerLb: aceCostResponse[0]?.cost_on_hand / aveCostResponse[0]?.lbs_on_hand,
          lastWithDrawalCost: lastCostResponse[0]?.LAST_COST,
          lastWithDrawalDate: lastCostResponse[0]?.LAST_WITHDRAWAL_DATE,
        },
      })
    }

    await odbcConn.close()

    return responses
  } catch (error) {
    console.error(error)

    setFlag('odbcErrorState', true) // set flag to prevent further requests

    await logEvent({
      event_type: 'error',
      funct: 'getInventoryLocationFile',
      reason: error.message,
      note: 'flip odbcErrorState flag',
    })
  }
}

module.exports.getLotCosts = getLotCosts
module.exports.getAverageCosts = getAverageCosts
