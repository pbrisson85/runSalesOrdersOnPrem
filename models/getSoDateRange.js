const getSoDateRange = soHeader => {
  const sorted = soHeader.sort((a, b) => {
    console.log('a.SCHEDULED_SHIP_DATE', a.SCHEDULED_SHIP_DATE)
    console.log('b.SCHEDULED_SHIP_DATE', b.SCHEDULED_SHIP_DATE)

    const dateA = new Date(a.SCHEDULED_SHIP_DATE)
    const dateB = new Date(b.SCHEDULED_SHIP_DATE)

    return dateA.getTime() - dateB.getTime()
  })

  const firstDate = sorted[0].SCHEDULED_SHIP_DATE
  const lastDate = sorted[sorted.length - 1].SCHEDULED_SHIP_DATE

  return { firstDate, lastDate }
}

module.exports = getSoDateRange
