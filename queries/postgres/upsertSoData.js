const logEvent = require('./logging')

const upsertSoData = async data => {
  try {
    const { Client } = require('pg')
    const pgClient = new Client() // config from ENV
    await pgClient.connect()

    let promises = []
    for (soLine of data) {
      const soNum = soLine.header.DOCUMENT_NUMBER
      const customerCode = soLine.header.CUSTOMER_CODE
      const customerName = soLine.header.CUSTOMER_NAME
      const shipDate = soLine.header.SCHEDULED_SHIP_DATE
      const custPoNumber = soLine.header.CUSTOMER_ORDER_NUMBER
      const outsideSalesRep = soLine.header.OUTSIDE_SALESPERSON_CODE
      const insideSalesRep = soLine.header.INSIDE_SALESPERSON_CODE
      const truckRoute = soLine.header.TRUCK_ROUTE
      const enteredBy = soLine.header.ENTERED_BY_CODE
      const creditStatus = soLine.header.CREDIT_STATUS_FLAG
      const shipToCode = soLine.header.SHIPTO_CODE
      const customerTermsCode = soLine.header.CUSTOMER_TERMS_CODE
      const shipMethod = soLine.header.SHIP_METHOD
      const fob = soLine.header.FOB
      const carrier = soLine.header.CARRIER
      const soLineNum = soLine.line.LINE_NUMBER
      const itemNum = soLine.line.ITEM_NUMBER
      const lineQty = soLine.line.QTY_ORDERED
      const unitPrice = soLine.line.LIST_PRICE
      const taxable = soLine.line.TAXABLE === 'Y' ? true : false
      const extSales = soLine.line.EXTENDED_SALES + soLine.line.EXTENDED_SALES_TAXABLE
      const pricingUnit = soLine.line.PRICING_UNIT
      const location = soLine.line.LOCATION
      const weightPerUm = soLine.line.WEIGHT_PER_UM
      const extWeight = soLine.line.LINE_WEIGHT
      const taggedWeight = soLine.line.TAGGED_WEIGHT
      const untaggedWeight = soLine.line.UNTAGGED_WEIGHT
      const remark1 = soLine.line.REL_REMARK_1
      const remark2 = soLine.line.REL_REMARK_2
      const remark3 = soLine.line.REL_REMARK_3
      const lotTracked = soLine.line.lotCosted
      const extRebate = typeof soLine.othp.rebate === 'undefined' ? 0 : soLine.othp.rebate
      const extDiscount = typeof soLine.othp.discount === 'undefined' ? 0 : soLine.othp.discount
      const extFreightOut = typeof soLine.othp.freight === 'undefined' ? 0 : soLine.othp.freight
      const extCommission = typeof soLine.othp.commission === 'undefined' ? 0 : soLine.othp.commission
      const extOthp = soLine.othp.total
      const aveCostPerLb = soLine.cost.weightedAveCost
      const extendedCost = soLine.cost.extendedCost
      const usedLastCost = soLine.cost.usedLastCost
      const lastCostDate = soLine.cost.lastCostDate
      const CostOutdatedOverYear = soLine.cost.CostOutdatedOverYear
      const noCostFound = soLine.cost.noCostFound

      // NEED TO CALC THE COST

      promises.push(
        pgClient.query(
          'INSERT INTO "salesReporting".sales_orders (so_num, customer_code, customer_name, ship_date, cust_po_num, out_sales_rep, in_sales_rep, entered_by, truck_route, credit_status, ship_to_code, cust_terms_code, ship_method, fob, carrier, so_line, item_num, taxable, line_qty, unit_price, ext_sales, pricing_unit, location, lbs_per_um, ext_weight, tagged_weight, untagged_weight, remark_1, remark_2, remark_3, lot_tracked, ext_rebate, ext_discount, ext_freight, ext_othp, ave_cost_per_lb, ext_cost, used_last_cost, last_cost_date, last_cost_outdated_over_year, no_cost_found, ext_comm) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42) ON CONFLICT (so_num, so_line) DO UPDATE SET so_num = $1, customer_code = $2, customer_name = $3, ship_date = $4, cust_po_num = $5, out_sales_rep = $6, in_sales_rep = $7, entered_by = $8, truck_route = $9, credit_status = $10, ship_to_code = $11, cust_terms_code = $12, ship_method = $13, fob = $14, carrier = $15, so_line = $16, item_num = $17, taxable = $18, line_qty = $19, unit_price = $20, ext_sales = $21, pricing_unit = $22, location = $23, lbs_per_um = $24, ext_weight = $25, tagged_weight = $26, untagged_weight = $27, remark_1 = $28, remark_2 = $29, remark_3 = $30, lot_tracked = $31, ext_rebate = $32, ext_discount = $33, ext_freight = $34, ext_othp = $35, ave_cost_per_lb = $36, ext_cost = $37, used_last_cost = $38, last_cost_date = $39, last_cost_outdated_over_year = $40, no_cost_found = $41, ext_comm = $42',
          [
            soNum,
            customerCode,
            customerName,
            shipDate,
            custPoNumber,
            outsideSalesRep,
            insideSalesRep,
            enteredBy,
            truckRoute,
            creditStatus,
            shipToCode,
            customerTermsCode,
            shipMethod,
            fob,
            carrier,
            soLineNum,
            itemNum,
            taxable,
            lineQty,
            unitPrice,
            extSales,
            pricingUnit,
            location,
            weightPerUm,
            extWeight,
            taggedWeight,
            untaggedWeight,
            remark1,
            remark2,
            remark3,
            lotTracked,
            extRebate,
            extDiscount,
            extFreightOut,
            extOthp,
            aveCostPerLb,
            extendedCost,
            usedLastCost,
            lastCostDate,
            CostOutdatedOverYear,
            noCostFound,
            extCommission,
          ]
        )
      )
    }

    const responses = await Promise.all(promises)

    let rowsUpdatedCount = 0
    responses.forEach(res => {
      rowsUpdatedCount += res.rowCount
    })

    console.log(`updated ${rowsUpdatedCount} rows`)

    await pgClient.end()

    return rowsUpdatedCount
  } catch (error) {
    console.log(error)

    await logEvent({
      event_type: 'error',
      funct: 'upsertSoData',
      reason: error.message,
      note: 'postgres query error',
    })

    return error
  }
}

module.exports = upsertSoData
