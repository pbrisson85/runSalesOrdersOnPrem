const joinData = (lines, header_unflat) => {
  const mappedData = lines.map(line => {
    return {
      ...line,
      ...header_unflat[line.ORDER_NUMBER],
    }
  })

  return mappedData
}

module.exports = joinData
