const joinData = (salesOrderLines, salesOrderHeader_unflat, taggedInventory_unflat, mappedNonLotCostedItems) => {
  // Map the item and cost into the

  const mappedData = salesOrderLines.map(line => {
    const { TAGGED_WEIGHT, ITEM_NUMBER, ORDER_NUMBER } = line

    const lotCosted = !mappedNonLotCostedItems.includes(ITEM_NUMBER)

    // determine if tagged inventory exists for this line
    const isTagged = TAGGED_WEIGHT > 0 && lotCosted

    // if tagged find the lot# and cost
    const lot = isTagged ? taggedInventory_unflat[ITEM_NUMBER][ORDER_NUMBER].LOT_NUMBER_OR_SIZE : null

    return {
      ...line,
      ...salesOrderHeader_unflat[ORDER_NUMBER],
      isTagged,
      lotCosted,
    }
  })

  return mappedData
}

module.exports = joinData
