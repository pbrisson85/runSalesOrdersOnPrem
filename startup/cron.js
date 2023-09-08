const CronJob = require('cron').CronJob
const generateSoData = require('../cron/generateSoData')
const runShipToTests = require('../tests/testShipToCountryState')

// define cron jobs
const runGenerateSoData = new CronJob('*/8 * * * *', () => generateSoData('cron'), null, false, 'America/New_York') // update every 10 minutes
const runShipToTestsJob = new CronJob('*/20 * * * *', () => runShipToTests(), null, false, 'America/New_York') // update every 20 minutes

// add cron.start() here to run the job on app startup
const runCronOnStartup = () => {
  runGenerateSoData.start()
  runShipToTestsJob.start()
}

module.exports.runCronOnStartup = runCronOnStartup
module.exports.runGenerateSoData = runGenerateSoData
