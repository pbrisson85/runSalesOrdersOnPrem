const getSoDateRange = soHeader => {
  const sorted = soHeader.sort((a, b) => {
    const dateA = new Date(a.SCHEDULED_SHIP_DATE)
    const dateB = new Date(b.SCHEDULED_SHIP_DATE)

    if (dateA.DOCUMENT_NUMBER === '366165') {
      console.log('dateA', dateA)
      console.log('dateB', dateB)
      console.log('dateA < dateB', dateA.getTime() < dateB.getTime())
      console.log('dateA > dateB', dateA.getTime() > dateB.getTime())
      console.log('dateA === dateB', dateA.getTime() === dateB.getTime())
    }

    return dateA.getTime() - dateB.getTime()
  })

  const firstDate = sorted[0].SCHEDULED_SHIP_DATE
  const lastDate = sorted[sorted.length - 1].SCHEDULED_SHIP_DATE

  console.log('firstDate', firstDate)
  console.log('lastDate', lastDate)

  return { firstDate, lastDate }
}

module.exports = getSoDateRange
