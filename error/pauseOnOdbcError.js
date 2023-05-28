const { runGenerateSoData } = require('../startup/cron')
const { setFlag } = require('../queries/postgres/flags')

const pauseOnOdbcError = async message => {
  const flag_id_1 = 'odbcErrorState'

  const minutes = 30

  console.log(`${message}. pause cron for ${minutes} minutes`)

  runGenerateSoData.stop()

  setTimeout(async () => {
    await setFlag(flag_id_1, false)
    console.log('resume cron')

    runGenerateSoData.start()
  }, [1000 * 60 * minutes])
}

module.exports = pauseOnOdbcError
