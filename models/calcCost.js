const calcCost = data => {
  console.log('hit the calcCost function...')

  data.forEach((soline, lineIx) => {
    // level of priority:
    // 1. lots tagged
    // 2. Ave inventory cost
    // 3. last cost

    // Instantiate flags
    let usedLastCost = false
    let lastCostDate = null
    let noCostFound = false
    let CostOutdatedOverYear = false

    // Calc tagged weight ave cost/lb
    let aveTaggedCost = 0
    if (soline.line.isTagged) {
      // Note using the isTagged flag because the line may have a tagged weight but no tagged lots if it is not a lot tracked item.
      // Get ave inventory cost for tagged weight

      soline.taggedLots.forEach(lot => {
        aveTaggedCost += (lot.taggedLbs / soline.line.TAGGED_WEIGHT) * lot.LAST_COST
      })
    }

    // Calc untagged weight ave cost/lb
    let aveUntaggedCost = 0
    if (soline.line.UNTAGGED_WEIGHT !== 0) {
      if (typeof soline.inventory !== 'undefined' && parseInt(soline.inventory.aveOnHandCostPerLb) !== 0 && soline.inventory.aveOnHandCostPerLb !== null) {
        aveUntaggedCost = soline.inventory.aveOnHandCostPerLb
      } else {
        if (typeof soline.lastSalesCost !== 'undefined') {

          if (soline.lastSalesCost === null) {

            console.log(soline)
          }

          aveUntaggedCost = soline.lastSalesCost.cost_lb
          usedLastCost = true
          lastCostDate = soline.lastSalesCost.formatted_invoice_date

          const today = new Date()
          const lastCostDateObj = new Date(lastCostDate)
          const diffTime = Math.abs(today - lastCostDateObj)
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          if (diffDays > 365) {
            CostOutdatedOverYear = true
          }
        }
      }
    } //prettier-ignore

    // Calc totals
    const weightedAveTaggedCost = (soline.line.TAGGED_WEIGHT / soline.line.LINE_WEIGHT) * aveTaggedCost
    const weightedAveUntaggedCost = (soline.line.UNTAGGED_WEIGHT / soline.line.LINE_WEIGHT) * aveUntaggedCost
    const weightedAveCost = weightedAveTaggedCost + weightedAveUntaggedCost
    const extendedCost = weightedAveCost * soline.line.LINE_WEIGHT
    if (extendedCost === 0) {
      noCostFound = true
    }

    // Add cost to line
    data[lineIx].cost = {
      usedLastCost,
      lastCostDate,
      CostOutdatedOverYear,
      noCostFound,
      weightedAveCost,
      extendedCost,
    }
  })

  return data
}

module.exports = calcCost
