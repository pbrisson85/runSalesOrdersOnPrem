const getSoDateRange = soHeader => {
  const sorted = soHeader.sort((a, b) => {
    const dateA = new Date(a.SCHEDULED_SHIP_DATE)
    const dateB = new Date(b.SCHEDULED_SHIP_DATE)

    return dateA.getTime() - dateB.getTime()
  })

  console.log('sorted[0]', sorted[0])
  console.log('sorted[1]', sorted[1])
  console.log('sorted[sorted.length - 1]', sorted[sorted.length - 1])

  const firstDate = sorted[0].SCHEDULED_SHIP_DATE
  const lastDate = sorted[sorted.length - 1].SCHEDULED_SHIP_DATE

  return { firstDate, lastDate }
}

module.exports = getSoDateRange
