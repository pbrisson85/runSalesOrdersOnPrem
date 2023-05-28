const generateSoData = require('../cron/generateSoData')
const router = require('express').Router()

// @route   GET /api/salesOrders/generate
// @desc
// @access

// Generate purchase data
router.get('/', async (req, res) => {
  console.log('\nget generate sales orders route hit.')

  // NOTE THIS IS ON CRON BUT THIS ROUTE EXISTS TO MANUALLY RUN IT

  const salesOrders = await generateSoData()

  res.send(salesOrders)
  console.log('get generate sales orders route comlete. \n')
})

module.exports = router
