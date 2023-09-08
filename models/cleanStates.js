// Filters the order ship to state field for valid states

const validateStates = (states, salesOrderHeader) => {
  const statesArr = states.map(state => state.code)

  const validStates = salesOrderHeader.map((order, idx) => {
    const validState = statesArr.includes(order.SHIPTO_STATE)

    return {
      ...order,
      SHIPTO_STATE: validState ? order.SHIPTO_STATE : null,
    }
  })

  return validStates
}

module.exports = validateStates
