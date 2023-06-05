const getSoDateRange = soHeader => {
  soHeader.sort((a, b) => {
    return new Date(a.SCHEDULED_SHIP_DATE) - new Date(b.SCHEDULED_SHIP_DATE)
  })

  const firstDate = soHeader[0].SCHEDULED_SHIP_DATE
  const lastDate = soHeader[soHeader.length - 1].SCHEDULED_SHIP_DATE

  return { firstDate, lastDate }
}

module.exports = getSoDateRange
