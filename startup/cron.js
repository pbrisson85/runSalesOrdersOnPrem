const CronJob = require('cron').CronJob
const generateSoData = require('../cron/generateSoData')

// define cron jobs
const runGenerateSoData = new CronJob('*/8 * * * *', () => generateSoData('cron'), null, false, 'America/New_York') // update every 10 minutes

// add cron.start() here to run the job on app startup
const runCronOnStartup = () => {
  runGenerateSoData.start()
}

module.exports.runCronOnStartup = runCronOnStartup
module.exports.runGenerateSoData = runGenerateSoData
