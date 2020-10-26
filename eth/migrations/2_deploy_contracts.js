const Sloth_Test_Harness = artifacts.require('Sloth_Test_Harness');

module.exports = function(deployer) {
  deployer.deploy(Sloth_Test_Harness)
    .then(() => Sloth_Test_Harness.deployed());
};
