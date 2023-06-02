const assignCatchWeightLine = (salesOrderLines, nonLotCostedItems) => {
  // assign a "tagged line number" to each line. This will be used to match up to the catch weight lines.
  let soNum = ''
  let counter = 0

  const soLines = salesOrderLines.map((line, ix) => {
    const { TAGGED_WEIGHT, ITEM_NUMBER, ORDER_NUMBER } = line

    if (ix === 0) soNum = ORDER_NUMBER // initialize soNum

    const lotCosted = !nonLotCostedItems.includes(ITEM_NUMBER)
    const isTagged = TAGGED_WEIGHT > 0 && lotCosted

    if (soNum !== ORDER_NUMBER) {
      // reset counter and soNum
      soNum = ORDER_NUMBER
      counter = 0
    } else {
      // increment counter
      if (isTagged) counter++
    }

    // assign counter to line

    return {
      ...line,
      taggedLineNum: counter,
      isTagged,
      lotCosted,
    }
  })
  return soLines
}
module.exports = assignCatchWeightLine
