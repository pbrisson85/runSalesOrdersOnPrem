const generateSoData = require('../cron/generateSoData')
const router = require('express').Router()
const logEvent = require('../queries/postgres/logging')

// @route   GET /api/salesOrders/generate
// @desc
// @access

// Generate purchase data
router.get('/', async (req, res) => {
  try {
    console.log('\nget generate sales orders route hit.')

    // NOTE THIS IS ON CRON BUT THIS ROUTE EXISTS TO MANUALLY RUN IT
    const salesOrders = await generateSoData('api route')

    res.send(salesOrders)
    console.log('get generate sales orders route comlete. \n')
  } catch (error) {
    await logEvent({
      event_type: 'error',
      funct: 'GET /api/salesOrders/generate',
      reason: error.message,
      note: 'api route',
    })
  }
})

module.exports = router
