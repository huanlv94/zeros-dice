require('dotenv').config();
const WalletProvider = require('truffle-wallet-provider')
const Wallet = require('ethereumjs-wallet')

const parsePrivateKey = privateKey => new Buffer(privateKey, "hex")

const getWalle = function (network) {
  let wallet;
  switch (network) {
    case 'ropsten':
      let ropstenPrivateKey = parsePrivateKey(process.env.ROPSTEN_PRIVATE_KEY)
      wallet = Wallet.fromPrivateKey(ropstenPrivateKey)
      break
    case 'rinkeby':
      let rinkebyPrivateKey = parsePrivateKey(process.env.RINKEBY_PRIVATE_KEY);
      wallet = Wallet.fromPrivateKey(rinkebyPrivateKey);
      break
    default:
      break
  }

  return wallet
}

const infuraProvider = function (network) {
  let wallet = getWalle(network)
  return new WalletProvider(wallet, `https://${network}.infura.io/`)
}

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: infuraProvider("ropsten"),
      gas: 4600000,
      gasPrice: 100000000000,
      network_id: "3"
    },
    rinkeby: {
      provider: infuraProvider("rinkeby"),
      gas: 4600000,
      gasPrice: 100000000000,
      network_id: "4"
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  mocha: {
    useColors: true
  }
};