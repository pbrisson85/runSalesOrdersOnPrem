const { createConnection } = require('../../database/seasoftODBC')
const { setFlag, getFlag } = require('../../queries/postgres/flags')
const logEvent = require('../../queries/postgres/logging')

const getSalesOrderlines = async () => {
  try {
    const errState = await getFlag('odbcErrorState')
    if (errState) return []

    const odbcConn = await createConnection()

    console.log(`query ODBC for sales order lines ...`)

    /*
    Note, not going to grab any OTHP at this time

    
    */

    const queryString = "SELECT {fn RTRIM(\"Order Line Items\".ODBC_DOCUMENT_NUMBER)} AS ORDER_NUMBER, \"Order Line Items\".LINE_NUMBER AS LINE_NUMBER, {fn RTRIM(\"Order Line Items\".ITEM_NUMBER)} AS ITEM_NUMBER, \"Order Line Items\".QTY_ORDERED, \"Order Line Items\".LIST_PRICE, {fn RTRIM(\"Order Line Items\".TAXABLE)} AS TAXABLE, \"Order Line Items\".LINE_NON_TAXABLE AS EXTENDED_SALES, \"Order Line Items\".LINE_TAXABLE AS EXTENDED_SALES_TAXABLE, \"Order Line Items\".COST, {fn RTRIM(\"Order Line Items\".PRICING_UNIT)} AS PRICING_UNIT, {fn RTRIM(\"Order Line Items\".LOCATION)} AS LOCATION, \"Order Line Items\".WEIGHT AS WEIGHT_PER_UM, \"Order Line Items\".WEIGHT \* \"Order Line Items\".QTY_ORDERED AS LINE_WEIGHT, \"Order Line Items\".BILLING_WEIGHT AS TAGGED_WEIGHT, \"Order Line Items\".WEIGHT \* \"Order Line Items\".QTY_ORDERED - \"Order Line Items\".BILLING_WEIGHT AS UNTAGGED_WEIGHT, \"Order Line Items\".SCHEDULED_SHIP_DATE, {fn RTRIM(\"Order Line Items\".TRUCK_ROUTE_CODE)} AS TRUCK_ROUTE_CODE, {fn RTRIM(\"Order Line Items\".REL_REMARK_1)} AS REL_REMARK_1, {fn RTRIM(\"Order Line Items\".REL_REMARK_2)} AS REL_REMARK_2, {fn RTRIM(\"Order Line Items\".REL_REMARK_3)} AS REL_REMARK_3, {fn RTRIM(\"Order Line Items\".OTHER_PRICE_CODES_1)} AS OTHER_PRICE_CODES_1, {fn RTRIM(\"Order Line Items\".OTHER_PRICE_CODES_2)} AS OTHER_PRICE_CODES_2, {fn RTRIM(\"Order Line Items\".OTHER_PRICE_CODES_3)} AS OTHER_PRICE_CODES_3, {fn RTRIM(\"Order Line Items\".OTHER_PRICE_CODES_4)} AS OTHER_PRICE_CODES_4, {fn RTRIM(\"Order Line Items\".OTHER_PRICE_CODES_5)} AS OTHER_PRICE_CODES_5, {fn RTRIM(\"Order Line Items\".OTHER_PRICE_CODES_6)} AS OTHER_PRICE_CODES_6, {fn RTRIM(\"Order Line Items\".OTHER_PRICE_CODES_7)} AS OTHER_PRICE_CODES_7, {fn RTRIM(\"Order Line Items\".OTHER_PRICE_CODES_8)} AS OTHER_PRICE_CODES_8, {fn RTRIM(\"Order Line Items\".OTHER_PRICE_CODES_9)} AS OTHER_PRICE_CODES_9, {fn RTRIM(\"Order Line Items\".OTHER_PRICE_CODES_10)} AS OTHER_PRICE_CODES_10, {fn RTRIM(\"Order Line Items\".OTHER_PRICE_CODES_11)} AS OTHER_PRICE_CODES_11, {fn RTRIM(\"Order Line Items\".OTHER_PRICE_CODES_12)} AS OTHER_PRICE_CODES_12, {fn RTRIM(\"Order Line Items\".OTHER_PRICE_CODES_13)} AS OTHER_PRICE_CODES_13, {fn RTRIM(\"Order Line Items\".OTHER_PRICE_CODES_14)} AS OTHER_PRICE_CODES_14, \"Order Line Items\".OTHER_PRICES_1, \"Order Line Items\".OTHER_PRICES_2, \"Order Line Items\".OTHER_PRICES_3, \"Order Line Items\".OTHER_PRICES_4, \"Order Line Items\".OTHER_PRICES_5, \"Order Line Items\".OTHER_PRICES_6, \"Order Line Items\".OTHER_PRICES_7, \"Order Line Items\".OTHER_PRICES_8, \"Order Line Items\".OTHER_PRICES_9, \"Order Line Items\".OTHER_PRICES_10, \"Order Line Items\".OTHER_PRICES_11, \"Order Line Items\".OTHER_PRICES_12, \"Order Line Items\".OTHER_PRICES_13, \"Order Line Items\".OTHER_PRICES_14 FROM 'Order Line Items' WHERE \"Order Line Items\".QTY_ORDERED > 0" //prettier-ignore

    const response = await odbcConn.query(queryString)

    await odbcConn.close()

    return response
  } catch (error) {
    console.error(error)

    setFlag('odbcErrorState', true) // set flag to prevent further requests

    await logEvent({
      event_type: 'error',
      funct: 'getSalesOrderlines',
      reason: error.message,
      note: 'flip odbcErrorState flag',
    })
  }
}

module.exports = getSalesOrderlines
