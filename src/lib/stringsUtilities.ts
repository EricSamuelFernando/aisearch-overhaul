export const shortenAddress = (address: string): string => {
  if (address?.length > 65) {
    return `${address.slice(0, 65)}...`
  }
  return address
}
