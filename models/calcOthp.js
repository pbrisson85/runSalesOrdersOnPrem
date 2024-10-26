const requestEmailNotification = require('../requests/requestEmail')

const calcOthp = (salesOrderLines, othpTable_unflat, othpDefinitions_unflat) => {
  // calc total othp,

  // if pricing_unit is lb than othp * weight, else othp * qty

  const othp = salesOrderLines.map(line => {
    const {
      ORDER_NUMBER,
      LINE_NUMBER,
      QTY_ORDERED,
      TAGGED_WEIGHT,
      UNTAGGED_WEIGHT,
      PRICING_UNIT,
      OTHER_PRICE_CODES_1,
      OTHER_PRICES_1,
      OTHER_PRICE_CODES_2,
      OTHER_PRICES_2,
      OTHER_PRICE_CODES_3,
      OTHER_PRICES_3,
      OTHER_PRICE_CODES_4,
      OTHER_PRICES_4,
      OTHER_PRICE_CODES_5,
      OTHER_PRICES_5,
      OTHER_PRICE_CODES_6,
      OTHER_PRICES_6,
      OTHER_PRICE_CODES_7,
      OTHER_PRICES_7,
      OTHER_PRICE_CODES_8,
      OTHER_PRICES_8,
      OTHER_PRICE_CODES_9,
      OTHER_PRICES_9,
      OTHER_PRICE_CODES_10,
      OTHER_PRICES_10,
      OTHER_PRICE_CODES_11,
      OTHER_PRICES_11,
      OTHER_PRICE_CODES_12,
      OTHER_PRICES_12,
      OTHER_PRICE_CODES_13,
      OTHER_PRICES_13,
      OTHER_PRICE_CODES_14,
      OTHER_PRICES_14,
    } = line

    const othpCodeArray = [
      OTHER_PRICE_CODES_1,
      OTHER_PRICE_CODES_2,
      OTHER_PRICE_CODES_3,
      OTHER_PRICE_CODES_4,
      OTHER_PRICE_CODES_5,
      OTHER_PRICE_CODES_6,
      OTHER_PRICE_CODES_7,
      OTHER_PRICE_CODES_8,
      OTHER_PRICE_CODES_9,
      OTHER_PRICE_CODES_10,
      OTHER_PRICE_CODES_11,
      OTHER_PRICE_CODES_12,
      OTHER_PRICE_CODES_13,
      OTHER_PRICE_CODES_14,
    ]

    const othpPriceArray = [
      OTHER_PRICES_1,
      OTHER_PRICES_2,
      OTHER_PRICES_3,
      OTHER_PRICES_4,
      OTHER_PRICES_5,
      OTHER_PRICES_6,
      OTHER_PRICES_7,
      OTHER_PRICES_8,
      OTHER_PRICES_9,
      OTHER_PRICES_10,
      OTHER_PRICES_11,
      OTHER_PRICES_12,
      OTHER_PRICES_13,
      OTHER_PRICES_14,
    ]

    const othpCodes = othpCodeArray.filter(code => code !== null)
    const othpPrices = othpPriceArray.filter(price => price !== null)

    const totalWeight = TAGGED_WEIGHT + UNTAGGED_WEIGHT
    const multiplier = PRICING_UNIT === 'LB' ? totalWeight : QTY_ORDERED

    // categorize othp
    const othpCodesAndPrices = othpCodes.map((code, index) => {
      const price = othpPrices[index]
      const cost = price * multiplier

      const contra = othpTable_unflat[code.trim()]?.[0]?.CONTRA ?? 'not found'
      // if contra not listed in contra_sales_gl_map table then ignore
      let ignore = false
      let definition = null
      if (typeof othpDefinitions_unflat[contra] === 'undefined') {
        if (contra === 'not found') {
          // send email notification
          // requestEmailNotification(`othp code: ${code} not found in othp table. Pertaining to sales order: ${ORDER_NUMBER}`)
          console.log(`othp code: ${code} not found in othp table. Pertaining to sales order: ${ORDER_NUMBER}`)
        }

        ignore = true
      } else {
        definition = othpDefinitions_unflat[contra][0].category
      }

      return {
        cost,
        definition,
        ignore,
      }
    })

    // sum by definition
    const othpByDefinition = othpCodesAndPrices.reduce((acc, cur) => {
      const { definition, cost, ignore } = cur

      if (ignore) return acc

      if (acc[definition]) {
        acc[definition] += cost
      } else {
        acc[definition] = cost
      }

      return acc
    }, {}) // { freight: 100, discount: 200, rebate: 300, commission: 400 }

    const totalOthp = othpCodesAndPrices.reduce((acc, cur) => {
      const { cost, ignore } = cur

      if (ignore) return acc

      acc += cost

      return acc
    }, 0) // 1000

    return {
      ORDER_NUMBER,
      LINE_NUMBER,
      ...othpByDefinition,
      total: totalOthp,
    }
  })

  return othp
}

module.exports = calcOthp
