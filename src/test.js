const price = await fetch ("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
const answer = await price.json()

console.log(typeof answer.ethereum.usd)
