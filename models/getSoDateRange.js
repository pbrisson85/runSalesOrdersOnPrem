const getSoDateRange = soHeader => {
  soHeader.sort((a, b) => {
    const dateA = new Date(a.SCHEDULED_SHIP_DATE)
    const dateB = new Date(b.SCHEDULED_SHIP_DATE)

    console.log('dateA', dateA)
    console.log('dateB', dateB)
    console.log('dateA < dateB', dateA.getTime() < dateB.getTime())
    console.log('dateA > dateB', dateA.getTime() > dateB.getTime())
    console.log('dateA === dateB', dateA.getTime() === dateB.getTime())

    if (dateA.getTime() < dateB.getTime()) return -1
    if (dateA.getTime() > dateB.getTime()) return 1
    return 0
  })

  const firstDate = soHeader[0].SCHEDULED_SHIP_DATE
  const lastDate = soHeader[soHeader.length - 1].SCHEDULED_SHIP_DATE

  return { firstDate, lastDate }
}

module.exports = getSoDateRange
