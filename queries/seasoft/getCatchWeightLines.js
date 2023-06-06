const { createConnection } = require('../../database/seasoftODBC')
const { setFlag, getFlag } = require('../../queries/postgres/flags')
const logEvent = require('../../queries/postgres/logging')

const getCatchWeightLines = async orders => {
  try {
    const errState = await getFlag('odbcErrorState')
    if (errState) return []

    const odbcConn = await createConnection()

    console.log(`query ODBC for Catch Weight Lines ...`)

    let responses = []
    let index = 0
    let renumberTaggedLineNum = {}

    for (eachOrderLine of orders) {
      const { ORDER_NUMBER, taggedLineNum, isTagged, LINE_NUMBER } = eachOrderLine
      index++
      if (!isTagged) continue

      const queryString = "SELECT {fn RTRIM(\"Catch Weight Lines\".DOCUMENT_LINE_KEY)} AS so_num, \"Catch Weight Lines\".WEIGHT_REC AS tagged_array, \"Catch Weight Lines\".QTY_COMMITTED AS qty_committed, \"Catch Weight Lines\".LOCATION_REC AS location_array FROM 'Catch Weight Lines' WHERE \"Catch Weight Lines\".DOCUMENT_LINE_KEY = ? AND \"Catch Weight Lines\".WEIGHT_REC IS NOT NULL" //prettier-ignore

      const response = await odbcConn.query(queryString, [ORDER_NUMBER])

      // Some orders are lot tracked and showing billed weight indicating they are tagged. However, the catch weight lines are not showing up in the catch weight table. I don;t know why this is happeneing but this section tests if the catch weight line is found. If not, then the order is not tagged. Also the taggedLineNum is tracked and offset for subsequent lines on the same order
      if (typeof response[taggedLineNum] === 'undefined') {
        console.log('no catch weight line found for order: ', ORDER_NUMBER, ' and line: ', LINE_NUMBER, ' and taggedLineNum: ', taggedLineNum)

        // flip isTagged flag to false
        orders[index - 1].isTagged = false

        // Need to re-number the taggedLineNums for this SO#
        if (typeof renumberTaggedLineNum[ORDER_NUMBER] === 'undefined') {
          renumberTaggedLineNum[ORDER_NUMBER] = { offset: 1, initialTaggedLineNum: taggedLineNum }
        } else {
          renumberTaggedLineNum[ORDER_NUMBER].offset++
        }

        continue
      } else {
        // re-number the taggedLineNums for this SO#
        if (typeof renumberTaggedLineNum[ORDER_NUMBER] === 'undefined') {
          responses.push({ ...response[taggedLineNum], soLine: LINE_NUMBER }) // proceed as normal
        } else {
          // re-number the taggedLineNums for this SO#

          if (taggedLineNum < renumberTaggedLineNum[ORDER_NUMBER].initialTaggedLineNum) {
            // make sure the taggedLineNum is not less than the initialTaggedLineNum
            console.log(
              'this order has a tagged line num offset but it is for a line AFTER the current line: ', ORDER_NUMBER, ' and line: ', LINE_NUMBER, ' and taggedLineNum: ', taggedLineNum
            ) //prettier-ignore

            responses.push({ ...response[taggedLineNum], soLine: LINE_NUMBER }) // proceed as normal
          } else {
            console.log(
              'offsetting the taggedLineNum for order: ', ORDER_NUMBER, ' and line: ', LINE_NUMBER, ' and taggedLineNum: ', taggedLineNum, ' by: ', renumberTaggedLineNum[ORDER_NUMBER].offset
            ) //prettier-ignore

            responses.push({ ...response[taggedLineNum - renumberTaggedLineNum[ORDER_NUMBER].offset], soLine: LINE_NUMBER }) // offset the taggedLineNum
          }
        }
      }
    }

    await odbcConn.close()

    return responses
  } catch (error) {
    console.error(error)

    setFlag('odbcErrorState', true) // set flag to prevent further requests

    await logEvent({
      event_type: 'error',
      funct: 'getCatchWeightLines',
      reason: error.message,
      note: 'flip odbcErrorState flag',
    })
  }
}

module.exports = getCatchWeightLines
