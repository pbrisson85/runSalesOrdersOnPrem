const startPgListen = async () => {
  require('../database/pgNotifications')()
}

module.exports = startPgListen
