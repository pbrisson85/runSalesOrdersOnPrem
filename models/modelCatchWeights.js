const modelCatchWeights = catchWeightLines => {
  try {
    console.log('entering modelCatchWeights...')

    let clean = {}
    const duplicateTest = new Set()

    catchWeightLines.forEach((cwLine, ix) => {
      if (typeof cwLine.tagged_array === 'undefined' || cwLine.tagged_array === null) console.log(cwLine) // DEBUG

      const { so_num, soLine } = cwLine

      // Clean seasoft arrays
      const taggedArray = cwLine.tagged_array.trim().split(/[\s\uFEFF\xA0]+/)
      const locArray = cwLine.location_array.trim().split(/[\s\uFEFF\xA0]+/)
      const numberOfLots = taggedArray.length / 3

      for (let i = 0; i < numberOfLots; i++) {
        // Pull data from arrays
        const qty = taggedArray[i * 3]
        const lbs = taggedArray[i * 3 + 1]
        const lot = taggedArray[i * 3 + 2]
        const loc = locArray[i]

        // Create unique key
        const uuid = `${soNum}-${soLine}-${lot}-${loc}`
        if (duplicateTest.has(uuid)) {
          console.log('duplicate uuid found in modelCatchWeights')
          console.log(uuid)
          console.log(cwLine)
          console.log(clean[uuid])
        }
        duplicateTest.add(uuid)

        clean[uuid] = {
          so_num,
          qty,
          lbs,
          lot,
          loc,
          soLine,
        }
      }
    })

    return clean
  } catch (error) {
    console.error(error)
  }
}

module.exports = modelCatchWeights

/*
modelCatchWeights FUNCTION FLATTENS THE CATCH WEIGHT LINES

catchWeightLines: [
        {
            "so_num": "367851",
            "tagged_array": "   2,466.00   29,592.00 B10142               34.00      408.00 B10143         ",
            "qty_committed": 2500,
            "location_array": "00SBFRD   00SBFRD   "
            "soLine": 1
        },
    ]

"catchWeightLinesModeled": {
        "0-0": {
            "so_num": "367851",
            "qty": "2,466.00",
            "lbs": "29,592.00",
            "lot": "B10142",
            "loc": "00SBFRD"
        },
        "0-1": {
            "so_num": "367851",
            "qty": "34.00",
            "lbs": "408.00",
            "lot": "B10143",
            "loc": "00SBFRD"
        },
        "1-0": {
            "so_num": "368453",
            "qty": "1000.000",
            "lbs": "22046.000",
            "lot": "B09792",
            "loc": "00SBFRD"
        },
 
*/
