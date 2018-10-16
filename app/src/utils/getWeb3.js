import Web3 from 'web3'

let getWeb3 = new Promise(function (resolve, reject) {
  // Wait for loading completion to avoid race conditions with web3 injection timing.
  window.addEventListener('load', async function () {
    var results
    var web3 = window.web3
    var ethereum = window.ethereum

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof ethereum !== 'undefined') {
      web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        results = { web3: web3 }

        console.log('Injected web3 (ethereum) detected.')
      } catch (error) {
        // User denied account access...
        console.log('User not allowed access to web3!', error)
      }
    } else if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider.
      web3 = new Web3(web3.currentProvider)

      results = { web3: web3 }

      console.log('Injected web3 (default) detected.')
    } else {
      // Fallback to localhost if no web3 injection. We've configured this to
      // use the development console's port by default.
      var provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545')

      web3 = new Web3(provider)

      results = { web3: web3 }

      console.log('No web3 instance injected, using Local web3.')
    }

    resolve(results)
  })
})

export default getWeb3
