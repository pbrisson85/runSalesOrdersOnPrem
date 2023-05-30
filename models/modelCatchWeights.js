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

        clean = {
          ...clean,
          [uuid]: {
            so_num: cwLine.so_num,
            lot: taggedArray[i * 3],
            qty: taggedArray[i * 3 + 1],
            weight: taggedArray[i * 3 + 2],
            location: locArray[i],
          },
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
catchWeightLines: [
        {
            "so_num": "367851",
            "tagged_array": "   2,466.00   29,592.00 B10142               34.00      408.00 B10143         ",
            "qty_committed": 2500,
            "location_array": "00SBFRD   00SBFRD   "
        },
    ]
 
*/
