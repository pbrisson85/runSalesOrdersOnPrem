// initialize environment variables
require('dotenv').config()

// initialize express server
const express = require('express')
const app = express()
const helmet = require('helmet')

// initialize routes
const generateSalesOrders = require('./routes/generateSalesOrders')

// initialize startup procedures
const { runCronOnStartup } = require('./startup/cron')
const startPgListen = require('./startup/pgNotifications')

// error handling
process.on('uncaughtException', async ex => {
  const { setAllFlagsFalse } = require('./queries/postgres/flags')
  await setAllFlagsFalse()
  require('./queries/postgres/logging')({
    event_type: 'error',
    funct: 'uncaughtException',
    reason: ex.message,
    note: 'uncaughtException error - exiting app',
  })

  console.error(ex)
  console.log('exiting app')
  process.exit(1)
})

process.on('unhandledRejection', async ex => {
  const { setAllFlagsFalse } = require('./queries/postgres/flags')
  await setAllFlagsFalse()

  require('./queries/postgres/logging')({
    event_type: 'error',
    funct: 'unhandledRejection',
    reason: ex.message,
    note: 'unhandledRejection error - exiting app',
  })

  console.error(ex)
  console.log('exiting app')
  process.exit(1)
})

// routes
app.use(helmet())
app.use(express.json())
app.use('/api/salesOrders/generate', generateSalesOrders)

// startup
runCronOnStartup()
startPgListen()

// start express server
const PORT = process.env.runSalesOrders_PORT || 5041
app.listen(PORT, () => console.log(`runSalesOrdersOnPrem running on port ${PORT} \n`))
