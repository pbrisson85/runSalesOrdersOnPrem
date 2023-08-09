const axios = require('axios')

// calls cloud microservice: mailer

const requestEmailNotification = async body => {
  try {
    const subject = 'ON PREM SERVICE NOTIFICATION - runSalesOrdersOnPrem'

    await axios({
      method: 'post',
      url: 'https://www.seaflow.fish/api/v1/mailer/onPremNotification',
      data: {
        subject,
        body,
      },
      headers: { 'x-auth-token': process.env.SEAFLOW_API_KEY },
    })

    return
  } catch (error) {
    console.error(error)

    return
  }
}

module.exports = requestEmailNotification
