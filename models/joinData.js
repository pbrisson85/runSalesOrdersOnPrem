const joinData = (salesOrderLines, salesOrderHeader_unflat, taggedInventory_unflat, lastSalesCost_unflat) => {
  // Map the item and cost into the

  const mappedData = salesOrderLines.map(line => {
    const { LINE_NUMBER, ORDER_NUMBER, ITEM_NUMBER } = line

    return {
      header: salesOrderHeader_unflat[ORDER_NUMBER][0],
      line,
      taggedLots: taggedInventory_unflat[`${ORDER_NUMBER}-${LINE_NUMBER}`],
      lastSalesCost: lastSalesCost_unflat[ITEM_NUMBER],
    }
  })

  return mappedData
}

module.exports = joinData
