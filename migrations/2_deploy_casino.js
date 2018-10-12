var HuanCasino = artifacts.require("./HuanCasino.sol");

module.exports = function (deployer) {
  deployer.deploy(HuanCasino, web3.toWei(0.1, 'ether'), 2, {
    gas: 3000000
  });
};
