const formatDate = (dateString: string) => {
  const date = new Date(dateString)

  const monthOptions: Intl.DateTimeFormatOptions = { month: 'long' }
  const dayOptions: Intl.DateTimeFormatOptions = { day: 'numeric' }
  const yearOptions: Intl.DateTimeFormatOptions = { year: 'numeric' }

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }

  const month = date.toLocaleDateString('en-US', monthOptions)
  const day = date.toLocaleDateString('en-US', dayOptions)
  const year = date.toLocaleDateString('en-US', yearOptions)
  const time = date.toLocaleTimeString('en-US', timeOptions)

  return { month, day, year, time }
}

export { formatDate }
