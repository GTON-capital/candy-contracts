const { FTM_CONFIG } = require("./config/ftm-config"); 
const { FTM_TESTNET_CONFIG } = require("./config/ftm-testnet-config"); 
const { ROPSTEN_CONFIG } = require("./config/ropsten-config");
const { LOCALHOST } = require("./config/localhost");

exports.GetConfig = function (network) {
    var CONFIG = {}
    switch (network) {
        case "fantom":
            CONFIG = FTM_CONFIG
            break;
        case "ftmTestnet":
            CONFIG = FTM_TESTNET_CONFIG
            break;
        case "ropsten":
            CONFIG = ROPSTEN_CONFIG
            break;
        case "localhost":
            CONFIG = FTM_TESTNET_CONFIG
            break;
    }
    return CONFIG
}
