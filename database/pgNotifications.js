const listenForPgNotification = async () => {
  const { pool } = require('../server')

  const pauseOnOdbcError = require('../error/pauseOnOdbcError')

  pool.query('LISTEN new_eod_start')
  pool.query('LISTEN send_sales_order_reporting_flag')

  // notify listener
  pool.on('notification', async msg => {
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
