const listenForPgNotification = async () => {
  const { Client } = require('pg')
  const pgClient = new Client() // config from ENV
  await pgClient.connect()
  const pauseOnOdbcError = require('../error/pauseOnOdbcError')

  pgClient.query('LISTEN new_eod_start')
  pgClient.query('LISTEN send_sales_order_reporting_flag')

  // notify listener
  pgClient.on('notification', async msg => {
    // event handler 1
    if (msg.channel === 'new_eod_start') {
      const payload = JSON.parse(msg.payload)

      if (payload.db === 'EAST') {
        pauseOnOdbcError('EOD DETECTED ON EAST')
      }
    }

    if (msg.channel === 'send_sales_order_reporting_flag') {
      const payload = JSON.parse(msg.payload)

      pauseOnOdbcError('ODBC ERROR')
    }
  })
}

module.exports = listenForPgNotification
