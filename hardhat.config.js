// require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config()


const { DEPLOYER_PRIVATE_KEY, ETHERSCAN_API_KEY, ALCHEMY_API_KEY } =
  process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    sepolia: {
      url: `${ALCHEMY_API_KEY}`,
      accounts: [`${DEPLOYER_PRIVATE_KEY}`]
    }
  }
};
