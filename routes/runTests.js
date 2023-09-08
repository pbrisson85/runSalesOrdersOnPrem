const runShipToTests = require('../tests/testShipToCountryState')
const router = require('express').Router()
const logEvent = require('../queries/postgres/logging')

// @route   GET /api/salesOrders/tests
// @desc
// @access

router.get('/', async (req, res) => {
  try {
    console.log('\nmanually run tests route hit.')

    const result = await runShipToTests()
    res.send(result)

    console.log('manually run tests route comlete. \n')
  } catch (error) {
    await logEvent({
      event_type: 'error',
      funct: 'GET /api/salesOrders/tests',
      reason: error.message,
      note: 'api route',
    })
  }
})

module.exports = router
