const joinData = (
  salesOrderLines,
  salesOrderHeader_unflat,
  taggedInventory_unflat,
  lastSalesCost_unflat,
  othpCalc_unflat,
  mappedPeriods,
  salespersonMaster_unflat,
  shipToFile_unflat,
  customerMaster_unflat,
  genTblCreditStatus_unflat,
  genTblShipMethod_unflat
) => {
  // Map the item and cost into the

  const mappedData = salesOrderLines.map(line => {
    const { LINE_NUMBER, ORDER_NUMBER, ITEM_NUMBER } = line

    const cust_code = salesOrderHeader_unflat[ORDER_NUMBER][0].CUSTOMER_CODE
    const shipto_code = salesOrderHeader_unflat[ORDER_NUMBER][0].SHIPTO_CODE

    const header = salesOrderHeader_unflat[ORDER_NUMBER][0]
    const taggedLots = taggedInventory_unflat[`${ORDER_NUMBER}-${LINE_NUMBER}`]
    const lastSalesCost = typeof lastSalesCost_unflat[ITEM_NUMBER] === 'undefined' ? null : lastSalesCost_unflat[ITEM_NUMBER][0]
    const othp = othpCalc_unflat[`${ORDER_NUMBER}-${LINE_NUMBER}`][0]
    const dateArr = header.SCHEDULED_SHIP_DATE.split('-') // result: [yyyy,m,d]
    const shipDate = new Date(dateArr[0], dateArr[1] - 1, dateArr[2], 0, 0, 0, 0).toLocaleString('en-US', {
      timeZone: 'America/New_York',
    })
    const period = mappedPeriods[shipDate]
    const salesPerson = salespersonMaster_unflat[header.OUTSIDE_SALESPERSON_CODE][0]
    const shipToFile =
      typeof shipToFile_unflat[`${cust_code}-${shipto_code}`] === 'undefined' ? null : shipToFile_unflat[`${cust_code}-${shipto_code}`][0]
    const customerMaster = customerMaster_unflat[cust_code][0]
    const creditStatus = genTblCreditStatus_unflat[header.CREDIT_STATUS_FLAG][0]

    console.log('ship method: ', header.SHIP_METHOD)

    const shipMethod = genTblShipMethod_unflat[header.SHIP_METHOD][0]

    return {
      header,
      line,
      taggedLots,
      lastSalesCost,
      othp,
      period,
      salesPerson,
      shipToFile,
      customerMaster,
      creditStatus,
      shipMethod,
    }
  })

  return mappedData
}

module.exports = joinData
