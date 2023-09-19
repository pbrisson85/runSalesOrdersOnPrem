const logEvent = require('./logging')
const { pool } = require('../../server')
const addHours = require('date-fns/addHours')
const addMinutes = require('date-fns/addMinutes')

const insertSoData = async data => {
  try {
    // get versions
    const maxVersion = await pool.query('SELECT MAX(version) FROM "salesReporting".sales_orders')
    let maxVersionNumber = maxVersion.rows[0].max

    if (maxVersionNumber === null) maxVersionNumber = 0
    console.log('new version number', parseInt(maxVersionNumber) + 1)

    let promises = []
    for (soLine of data) {
      let state = null
      let country = null
      let address_source = null
      if (soLine.shipToFile !== null) {
        // Use ship to file
        address_source = 'ship_to_file'
        country = soLine.shipToFile.COUNTRY_CODE
        if (country === 'USA') {
          state = soLine.shipToFile.STATE
        } else {
          state = 'OUTSIDE USA'
        }
      } else if (soLine.header.SHIPTO_STATE !== null) {
        // Use order info
        address_source = 'order_info'
        country = 'USA' // orderInfo has been filtered to only include valid US states
        state = soLine.header.SHIPTO_STATE
      } else {
        // Use customer master file
        address_source = 'customer_master'
        country = soLine.customerMaster.COUNTRY_CODE
        if (country === 'USA') {
          state = soLine.customerMaster.STATE
        } else {
          state = 'OUTSIDE USA'
        }
      }

      const soNum = soLine.header.DOCUMENT_NUMBER
      const customerCode = soLine.header.CUSTOMER_CODE
      const customerName = soLine.header.CUSTOMER_NAME
      const shipDate = soLine.header.SCHEDULED_SHIP_DATE
      const custPoNumber = soLine.header.CUSTOMER_ORDER_NUMBER
      const outsideSalesRep = soLine.header.OUTSIDE_SALESPERSON_CODE
      const outsideSalesRepName = soLine.salesPerson.NAME
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
      const extFreightOut = typeof soLine.othp.outbound === 'undefined' ? 0 : soLine.othp.outbound
      const extCommission = typeof soLine.othp.commission === 'undefined' ? 0 : soLine.othp.commission
      const extOthp = typeof soLine.othp.total === 'undefined' ? 0 : soLine.othp.total
      const aveCostPerLb = soLine.cost.weightedAveCost
      const extendedCost = soLine.cost.extendedCost
      const usedLastCost = soLine.cost.usedLastCost
      const lastCostDate = soLine.cost.lastCostDate
      const CostOutdatedOverYear = soLine.cost.CostOutdatedOverYear
      const noCostFound = soLine.cost.noCostFound
      const formatted_ship_date = new Date(soLine.period.formattedDate)
      const fiscal_year = parseInt(soLine.period.fiscal_year)
      const period = parseInt(soLine.period.period)
      const week = parseInt(soLine.period.week)
      const period_serial = soLine.period.period_serial
      const week_serial = soLine.period.week_serial
      const aveTaggedCost = soLine.cost.aveTaggedCost
      const aveUntaggedCost = soLine.cost.aveUntaggedCost
      const sales_net_ext = extSales - extOthp
      const gross_margin_ext = extSales - extendedCost - extOthp
      const sales_net_lb = sales_net_ext / extWeight
      const gross_margin_lb = gross_margin_ext / extWeight
      const rebate_lb = extRebate / extWeight
      const discount_lb = extDiscount / extWeight
      const freight_lb = extFreightOut / extWeight
      const commission_lb = extCommission / extWeight
      const othp_lb = extOthp / extWeight
      const gross_margin_tagged_lb = taggedWeight > 0 ? unitPrice - aveTaggedCost : 0
      const gross_margin_untagged_lb = untaggedWeight > 0 ? unitPrice - aveUntaggedCost : 0
      const gross_margin_tagged = taggedWeight * gross_margin_tagged_lb
      const gross_margin_untagged = untaggedWeight * gross_margin_untagged_lb
      const cost_ext_tagged = taggedWeight * aveTaggedCost
      const cost_ext_untagged = untaggedWeight * aveUntaggedCost

      const creditStatusDesc = soLine.creditStatus.TABLE_DESC
      const logisticsStatus = soLine.shipMethod.TABLE_DESC
      //const soEnteredDate = new Date(soLine.header.DOCUMENT_DATE) // Doesnt give the timezone offset
      let soEnteredDate = soLine.header.DOCUMENT_DATE.split('-') // result: [yyyy,m,d]
      soEnteredDate = new Date(soEnteredDate[0], soEnteredDate[1] - 1, soEnteredDate[2], 0, 0, 0, 0) // for some reason if I dont instantiate the date this way I dont get the timezone offset

      // NEED TO CALC THE COST

      promises.push(
        pool.query(
          `INSERT 
            INTO "salesReporting".sales_orders 
            (so_num, customer_code, customer_name, ship_date, cust_po_num, out_sales_rep, in_sales_rep, entered_by, truck_route, credit_status, ship_to_code, cust_terms_code, ship_method, fob, carrier, so_line, item_num, taxable, line_qty, unit_price, ext_sales, pricing_unit, location, lbs_per_um, ext_weight, tagged_weight, untagged_weight, remark_1, remark_2, remark_3, lot_tracked, ext_rebate, ext_discount, ext_freight, ext_othp, ave_cost_per_lb, ext_cost, used_last_cost, last_cost_date, last_cost_outdated_over_year, no_cost_found, ext_comm, version, timestamp, date_written, formatted_ship_date, fiscal_year, period, week, period_serial, week_serial, ave_tagged_cost, ave_untagged_cost, sales_net_ext, gross_margin_ext, sales_net_lb, gross_margin_lb, rebate_lb, discount_lb, freight_lb, commission_lb, othp_lb, gross_margin_tagged_lb, gross_margin_untagged_lb, gross_margin_tagged, gross_margin_untagged, cost_ext_tagged, cost_ext_untagged, out_sales_rep_name, state, country, address_source, domestic, north_america, credit_status_desc, logistics_status, so_entered_timestamp) 
            
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61, $62, $63, $64, $65, $66, $67, $68, $69, $70, $71, $72, $73, $74, $75, $76, $77) 
            
            ON CONFLICT DO NOTHING`,
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
            parseInt(maxVersionNumber) + 1,
            Date.now(),
            new Date(),
            formatted_ship_date,
            fiscal_year,
            period,
            week,
            period_serial,
            week_serial,
            aveTaggedCost,
            aveUntaggedCost,
            sales_net_ext,
            gross_margin_ext,
            sales_net_lb,
            gross_margin_lb,
            rebate_lb,
            discount_lb,
            freight_lb,
            commission_lb,
            othp_lb,
            gross_margin_tagged_lb,
            gross_margin_untagged_lb,
            gross_margin_tagged,
            gross_margin_untagged,
            cost_ext_tagged,
            cost_ext_untagged,
            outsideSalesRepName,
            state,
            country,
            address_source,
            country === 'USA' ? 'DOMESTIC' : 'INTERNATIONAL',
            country === 'USA' || country === 'CANADA' || country === 'CAN' ? 'NORTH AMERICA' : 'INTERNATIONAL',
            creditStatusDesc,
            logisticsStatus,
            soEnteredDate,
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

    // delete the oldest version if more than three versions exist
    console.log(`query postgres to delete the sales orders ...`)

    const numVersions = await pool.query('SELECT DISTINCT(version) AS version FROM "salesReporting".sales_orders ORDER BY version ASC')

    const lowestVersion = numVersions.rows[0].version

    if (numVersions.rows.length > 3) {
      const deleteResponse = await pool.query(
        'DELETE FROM "salesReporting".sales_orders WHERE version = (SELECT MIN(version) FROM "salesReporting".sales_orders)'
      )

      console.log(`deleted ${deleteResponse.rowCount} rows of version: ${lowestVersion}`)
    }

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

module.exports = insertSoData
