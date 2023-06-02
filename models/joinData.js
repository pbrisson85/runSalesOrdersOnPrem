const joinData = (salesOrderLines, salesOrderHeader_unflat, taggedInventory_unflat) => {
  // Map the item and cost into the

  const mappedData = salesOrderLines.map(line => {
    const { LINE_NUMBER, ORDER_NUMBER } = line

    return {
      ...line,
      ...salesOrderHeader_unflat[ORDER_NUMBER],
      taggedLots: taggedInventory_unflat[`${ORDER_NUMBER}-${LINE_NUMBER}`],
    }
  })

  return mappedData
}

module.exports = joinData
