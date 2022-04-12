import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "hardhat-abi-exporter";
import "@nomiclabs/hardhat-etherscan";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
export default {
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    ftm: {
      // url: "https://rpc.ankr.com/fantom",
      url: "https://rpcapi-tracing.fantom.network",
      accounts: process.env.PK ? [process.env.PK] : undefined,
    },
    goerli: {
      timeout: 60000,
      url: "https://rpc.goerli.mudit.blog/",
      accounts: process.env.TESTNET_PK ? [process.env.TESTNET_PK] : undefined,
    },
    ftmTestnet: {
      // gas: 5000000,
      // url: "https://rpc.ankr.com/fantom",
      url: "https://rpc.testnet.fantom.network",
      accounts: process.env.TESTNET_PK ? [process.env.TESTNET_PK] : undefined,
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN,
      ropsten: process.env.ETHERSCAN,
      rinkeby: process.env.ETHERSCAN,
      goerli: process.env.ETHERSCAN,
      kovan: process.env.ETHERSCAN,
      // ftm
      opera: process.env.FTMSCAN,
      ftmTestnet: process.env.FTMSCAN,
      // polygon
      polygon: process.env.POLYGONSCAN,
      polygonMumbai: process.env.POLYGONSCAN,
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.7",
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
      {
        version: "0.6.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
      {
        version: "0.6.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
      {
        version: "0.6.9",
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
    ],
  },
  abiExporter: {
    clear: true,
    flat: true,
    spacing: 2,
  },
  mocha: {
    timeout: "100000000000000",
  },
};
