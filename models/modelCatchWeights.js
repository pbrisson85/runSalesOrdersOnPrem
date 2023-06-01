const modelCatchWeights = catchWeightLines => {
  try {
    console.log('entering modelCatchWeights...')

    let clean = {}

    catchWeightLines.forEach((cwLine, ix) => {
      if (typeof cwLine === 'undefined') return

      const taggedArray = cwLine.tagged_array.trim().split(/[\s\uFEFF\xA0]+/)
      const locArray = cwLine.location_array.trim().split(/[\s\uFEFF\xA0]+/)
      const numberOfLots = taggedArray.length / 3

      for (let i = 0; i < numberOfLots; i++) {
        const uuid = `${ix}-${i}`

        clean[uuid] = {
          so_num: cwLine.so_num,
          qty: taggedArray[i * 3],
          lbs: taggedArray[i * 3 + 1],
          lot: taggedArray[i * 3 + 2],
          loc: locArray[i],
          soLine: cwLine.soLine,
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
