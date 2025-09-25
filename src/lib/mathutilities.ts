const formatNumber = (amount: number) => {
  const amountString = String(amount || 0)

  const formattedAmount = amountString.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return `$ ${formattedAmount}`
}

const normalizeInput = (value: string, previousValue: string | any[]) => {
  // return nothing if no value
  if (!value) return value

  // only allows 0-9 inputs
  const currentValue = value?.replace(/[^\d]/g, '')
  const cvLength = currentValue?.length

  if (!previousValue || value.length > previousValue.length) {
    // returns: "x", "xx", "xxx"
    if (cvLength < 4) return currentValue

    // returns: "(xxx)", "(xxx) x", "(xxx) xx", "(xxx) xxx",
    if (cvLength < 7)
      return `(+${currentValue.slice(0, 1)}) ${currentValue.slice(0)}`

    // returns this format: "(+1) 555 563 7128"
    return `(+${currentValue.slice(0, 1)}) ${currentValue.slice(1, 4)} ${currentValue.slice(4, 7)} ${currentValue.slice(7, 11)}`
  }
}

export { formatNumber, normalizeInput }
