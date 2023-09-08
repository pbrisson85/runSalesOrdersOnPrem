const { createConnection } = require('../../database/seasoftODBC')
const { setFlag, getFlag } = require('../../queries/postgres/flags')
const logEvent = require('../../queries/postgres/logging')
const requestEmailNotification = require('../../requests/requestEmail')

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

      let response = await odbcConn.query(queryString, [loc, lot, item])

      if (typeof response[0] === 'undefined') {
        // await requestEmailNotification(
        //   `In Function: getLotCosts, No inventory found for item: ${item}, lot: ${lot}, loc: ${loc}. This is likely an ODBC error. Try to manually run the query on Inventory Location File to test. Since this is a catch weight item table, it does not make sense that it is not in inventory. Going to try to run using wildcards...`
        // )

        await logEvent({
          event_type: 'error',
          funct: 'getLotCosts',
          reason: 'No inventory found',
          note: `No inventory found for item: ${item}, lot: ${lot}, loc: ${loc}. This is likely an ODBC error. Try to manually run the query on Inventory Location File to test.`,
        })

        const queryString = "SELECT {fn RTRIM(\"Inventory Location File\".ITEM_NUMBER)} AS ITEM_NUMBER, {fn RTRIM(\"Inventory Location File\".LOCATION)} AS LOCATION, {fn RTRIM(\"Inventory Location File\".LOT_NUMBER_OR_SIZE)} AS LOT, \"Inventory Location File\".LAST_COST FROM 'Inventory Location File' WHERE \"Inventory Location File\".ON_HAND_IN_UM <> 0 AND \"Inventory Location File\".LOCATION LIKE ? AND \"Inventory Location File\".LOT_NUMBER_OR_SIZE LIKE ? AND \"Inventory Location File\".ITEM_NUMBER LIKE ?" //prettier-ignore

        response = await odbcConn.query(queryString, [`${loc}%`, `${lot}%`, `${item}%`])

        if (typeof response[0] === 'undefined') {
          await requestEmailNotification(
            `In Function: getLotCosts, No inventory found for item: ${item}, lot: ${lot}, loc: ${loc}. This is likely an ODBC error. Try to manually run the query on Inventory Location File to test. Since this is a catch weight item table, it does not make sense that it is not in inventory. Alternatively already tried running the query using wildcards in the variables which also failed.`
          )

          await logEvent({
            event_type: 'error',
            funct: 'getLotCosts',
            reason: 'No inventory found',
            note: `Tried alternative query with LIKE % but still no inventory found`,
          })
        } else {
          // await requestEmailNotification(
          //   `wildcards worked`
          // )
          await logEvent({
            event_type: 'error',
            funct: 'getLotCosts',
            reason: 'No inventory found - Alternative worked',
            note: `No inventory found for item: ${item}, lot: ${lot}, loc: ${loc}. Tried alternative query with LIKE % and this worked`,
          })
        }
      }

      // Note that multiple items can be tagged to the same lot and location. They appear to be in the same order as the sales order lines

      responses.push({
        ...response[0],
        taggedLbs: parseFloat(lbs.replace(/,/g, '')),
        taggedQty: parseFloat(qty.replace(/,/g, '')),
        so_num,
        soLine,
      })
    }

    await odbcConn.close()

    return responses
  } catch (error) {
    console.error(error)

    setFlag('odbcErrorState', true) // set flag to prevent further requests

    await logEvent({
      event_type: 'error',
      funct: 'getLotCosts',
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
      /*

      Note: I was using this query but seasoft was incurring a weird segmentation fault on ONE item with this query. I tested manually and could pull the data, could do the sums and multiplications except when multiplying for the cost_on_hand there was an internal seasoft error. I tried to use an alternative ODBC but same issue so proof that the bug was within seasoft. Remedy is to pull data and manually do the calculations in node. I'm leaving the query here for reference.


      const queryString_1 = "SELECT {fn RTRIM(\"Inventory Location File\".ITEM_NUMBER)} AS ITEM_NUMBER, SUM(\"Inventory Location File\".ON_HAND_IN_UM * \"Inventory Location File\".LOT_AVERAGE_WEIGHT) AS lbs_on_hand, SUM(\"Inventory Location File\".ON_HAND_IN_UM * \"Inventory Location File\".LOT_AVERAGE_WEIGHT * \"Inventory Location File\".LAST_COST) AS cost_on_hand FROM 'Inventory Location File' WHERE \"Inventory Location File\".ON_HAND_IN_UM <> 0 AND \"Inventory Location File\".ITEM_NUMBER = ? GROUP BY \"Inventory Location File\".ITEM_NUMBER" //prettier-ignore
      */

      const queryString_1 = "SELECT {fn RTRIM(\"Inventory Location File\".ITEM_NUMBER)} AS ITEM_NUMBER, \"Inventory Location File\".ON_HAND_IN_UM, \"Inventory Location File\".LOT_AVERAGE_WEIGHT, \"Inventory Location File\".LAST_COST FROM 'Inventory Location File' WHERE \"Inventory Location File\".ON_HAND_IN_UM <> 0 AND \"Inventory Location File\".ITEM_NUMBER = ?" //prettier-ignore

      const aveCostResponse = await odbcConn.query(queryString_1, [line.line.ITEM_NUMBER])

      // manually calc the lbs_on_hand and cost_on_hand

      let lbs_on_hand = 0
      let cost_on_hand = 0

      for (item of aveCostResponse) {
        lbs_on_hand += item.ON_HAND_IN_UM * item.LOT_AVERAGE_WEIGHT
        cost_on_hand += item.ON_HAND_IN_UM * item.LOT_AVERAGE_WEIGHT * item.LAST_COST
      }

      if (lbs_on_hand === 0) {
        // calcCost function needs the inventory key to be undefined if there is none to porperly calc extended inventory
        responses.push({
          ...line,
        })
      } else {
        responses.push({
          ...line,
          inventory: {
            costOnHand: cost_on_hand,
            lbsOnHand: lbs_on_hand,
            aveOnHandCostPerLb: cost_on_hand / lbs_on_hand,
          },
        })
      }
    }

    await odbcConn.close()

    return responses
  } catch (error) {
    console.log('error in getAverageCosts: ', error)
    console.error(error)

    setFlag('odbcErrorState', true) // set flag to prevent further requests

    await logEvent({
      event_type: 'error',
      funct: 'getAverageCosts',
      reason: error.message,
      note: 'flip odbcErrorState flag',
    })
  }
}

module.exports.getLotCosts = getLotCosts
module.exports.getAverageCosts = getAverageCosts
