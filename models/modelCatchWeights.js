const modelCatchWeights = catchWeightLines => {
  let modeled = []

  catchWeightLines.forEach((cwLine, ix) => {
    // also pass in the tagged so lines and find the line#, item#, lot# (note cant do this without doing a query on the lot # to the inventory loc file)

    const taggedArray = cwLine.tagged_array.split(/\s+/)
    const locArray = cwLine.location_array.split(/\s+/)
    const numberOfLots = taggedArray.length / 3

    let lotData = {}
    for (let i = 0; i < numberOfLots; i++) {
      const uuid = `${ix}-${i}`

      lotData = {
        ...lotData,
        [uuid]: {
          so_num: cwLine.so_num,
          lot: taggedArray[i * 3],
          qty: taggedArray[i * 3 + 1],
          weight: taggedArray[i * 3 + 2],
          location: locArray[i],
        },
      }
    }

    modeled.push(lotData)
  })

  return modeled
}

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
