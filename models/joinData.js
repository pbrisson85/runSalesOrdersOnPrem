const joinData = (salesOrderLines, salesOrderHeader_unflat, taggedInventory_unflat, lastSalesCost_unflat, othpCalc_unflat, mappedPeriods) => {
  // Map the item and cost into the

  const mappedData = salesOrderLines.map(line => {
    const { LINE_NUMBER, ORDER_NUMBER, ITEM_NUMBER } = line

    const header = salesOrderHeader_unflat[ORDER_NUMBER][0]
    const taggedLots = taggedInventory_unflat[`${ORDER_NUMBER}-${LINE_NUMBER}`]
    const lastSalesCost = typeof lastSalesCost_unflat[ITEM_NUMBER] === 'undefined' ? null : lastSalesCost_unflat[ITEM_NUMBER][0]
    const othp = othpCalc_unflat[`${ORDER_NUMBER}-${LINE_NUMBER}`]
    const dateArr = header.SCHEDULED_SHIP_DATE.split('-') // result: [yyyy,m,d]
    const shipDate = new Date(dateArr[0], dateArr[1] - 1, dateArr[2], 0, 0, 0, 0).toLocaleString('en-US', {
      timeZone: 'America/New_York',
    })
    const period = mappedPeriods[shipDate]

    return {
      header,
      line,
      taggedLots,
      lastSalesCost,
      othp,
      period,
    }
  })

  return mappedData
}

module.exports = joinData
