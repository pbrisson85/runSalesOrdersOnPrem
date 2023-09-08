// NET while other places using NLD)

const sql = require('../server')
const requestEmailNotification = require('../requests/requestEmail')

const runShipToTests = async () => {
  console.log('running ship to country state tests...')

  let errors = []

  // state should never be blank wih a USA ship to
  console.log('query for blank state')
  const blankState = await sql`
    SELECT so.customer_code, so.customer_name, so.ship_to_code, so.address_source
    FROM "salesReporting".sales_orders AS so
    WHERE (so.state = '' OR so.state IS NULL) AND so.country = 'USA'
    GROUP BY so.customer_code, so.customer_name, so.ship_to_code, so.address_source
    `

  if (blankState.length) {
    let err = `Data testing exception: BLANK STATE found in salesReporting.sales_line_items: ${JSON.stringify(blankState)}`
    errors.push(err)
    await requestEmailNotification(err)
  }

  // country should never be blank
  console.log('query for blank country')
  const blankCountry = await sql`
    SELECT so.customer_code, so.customer_name, so.ship_to_code, so.address_source
    FROM "salesReporting".sales_orders AS so
    WHERE so.country = '' OR so.country IS NULL
    GROUP BY so.customer_code, so.customer_name, so.ship_to_code, so.address_source
    `

  if (blankCountry.length) {
    let err = `Data testing exception: BLANK COUNTRY found in salesReporting.sales_line_items: ${JSON.stringify(blankCountry)}`
    errors.push(err)
    await requestEmailNotification(err)
  }

  // state should always read 'OUTSIDE USA' with a non USA ship to
  console.log('query for outside usa state')
  const outSideUsaState = await sql`
    SELECT so.customer_code, so.customer_name, so.ship_to_code, so.address_source
    FROM "salesReporting".sales_orders AS so
    WHERE so.state <> 'OUTSIDE USA' AND so.country <> 'USA'
    GROUP BY so.customer_code, so.customer_name, so.ship_to_code, so.address_source
    `

  if (outSideUsaState.length) {
    let err = `Data testing exception: missing 'OUTSIDE USA' in state field for foreign country code found in salesReporting.sales_line_items: ${JSON.stringify(
      outSideUsaState
    )}`
    errors.push(err)
    await requestEmailNotification(err)
  }

  // state should never say 'OUTSIDE USA' with a USA ship to
  console.log('query for outside usa country')
  const outSideUsaCountry = await sql`
    SELECT so.customer_code, so.customer_name, so.ship_to_code, so.address_source
    FROM "salesReporting".sales_orders AS so
    WHERE so.state = 'OUTSIDE USA' AND so.country = 'USA'
    GROUP BY so.customer_code, so.customer_name, so.ship_to_code, so.address_source
    `

  if (outSideUsaCountry.length) {
    let err = `Data testing exception: 'OUTSIDE USA' in state field for 'USA' country code found in salesReporting.sales_line_items: ${JSON.stringify(
      outSideUsaCountry
    )}`
    errors.push(err)
    await requestEmailNotification(err)
  }

  if (!errors.length) {
    errors.push('No errors found in ship to country state tests')
    console.log('No errors found')
  } else {
    console.log('errors found')
  }

  return errors
}

module.exports = runShipToTests