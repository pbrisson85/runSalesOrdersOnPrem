const { runGenerateSoData } = require('../startup/cron')
const { setFlag } = require('../queries/postgres/flags')
const logEvent = require('../queries/postgres/logging')

const pauseOnOdbcError = async message => {
  const flag_id_1 = 'odbcErrorState'
  const minutes = 30

  await logEvent({
    event_type: 'info',
    funct: 'pauseOnOdbcError',
    reason: 'pg notification',
    note: `PAUSE all cron for ${minutes} minutes`,
  })

  console.log(`${message}. pause cron for ${minutes} minutes`)

  runGenerateSoData.stop()

  setTimeout(async () => {
    await setFlag(flag_id_1, false)
    console.log('resume cron')

    runGenerateSoData.start()

    await logEvent({
      event_type: 'info',
      funct: 'pauseOnOdbcError',
      reason: 'pg notification',
      note: 'RESUME all cron',
    })
  }, [1000 * 60 * minutes])
}

module.exports = pauseOnOdbcError
