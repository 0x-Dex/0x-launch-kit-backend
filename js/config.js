'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
// tslint:disable:custom-no-magic-numbers
const _0x_js_1 = require('0x.js');
const assert_1 = require('@0x/assert');
const crypto = require('crypto');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const metadataPath = path.join(__dirname, '../../metadata.json');
var EnvVarType;
(function(EnvVarType) {
    EnvVarType[(EnvVarType['Port'] = 0)] = 'Port';
    EnvVarType[(EnvVarType['NetworkId'] = 1)] = 'NetworkId';
    EnvVarType[(EnvVarType['FeeRecipient'] = 2)] = 'FeeRecipient';
    EnvVarType[(EnvVarType['UnitAmount'] = 3)] = 'UnitAmount';
    EnvVarType[(EnvVarType['Url'] = 4)] = 'Url';
    EnvVarType[(EnvVarType['WhitelistAllTokens'] = 5)] = 'WhitelistAllTokens';
})(EnvVarType || (EnvVarType = {}));
// Whitelisted token addresses. Set to a '*' instead of an array to allow all tokens.
exports.WHITELISTED_TOKENS = _.isEmpty(process.env.WHITELIST_ALL_TOKENS)
    ? '*'
    : assertEnvVarType('WHITELIST_ALL_TOKENS', process.env.WHITELIST_ALL_TOKENS, EnvVarType.WhitelistAllTokens);
// Network port to listen on
exports.HTTP_PORT = _.isEmpty(process.env.HTTP_PORT)
    ? 3000
    : assertEnvVarType('HTTP_PORT', process.env.HTTP_PORT, EnvVarType.Port);
// Default network id to use when not specified
exports.NETWORK_ID = _.isEmpty(process.env.NETWORK_ID)
    ? 1
    : assertEnvVarType('NETWORK_ID', process.env.NETWORK_ID, EnvVarType.NetworkId);
// The fee recipient for orders
exports.FEE_RECIPIENT = _.isEmpty(process.env.FEE_RECIPIENT)
    ? getDefaultFeeRecipient()
    : assertEnvVarType('FEE_RECIPIENT', process.env.FEE_RECIPIENT, EnvVarType.FeeRecipient);
// A flat fee in ZRX that should be charged to the order maker
exports.MAKER_FEE_ZRX_UNIT_AMOUNT = _.isEmpty(process.env.MAKER_FEE_ZRX_UNIT_AMOUNT)
    ? new _0x_js_1.BigNumber(0)
    : assertEnvVarType('MAKER_FEE_ZRX_UNIT_AMOUNT', process.env.MAKER_FEE_ZRX_UNIT_AMOUNT, EnvVarType.UnitAmount);
// A flat fee in ZRX that should be charged to the order taker
exports.TAKER_FEE_ZRX_UNIT_AMOUNT = _.isEmpty(process.env.TAKER_FEE_ZRX_UNIT_AMOUNT)
    ? new _0x_js_1.BigNumber(0)
    : assertEnvVarType('TAKER_FEE_ZRX_UNIT_AMOUNT', process.env.TAKER_FEE_ZRX_UNIT_AMOUNT, EnvVarType.UnitAmount);
// Ethereum RPC url
exports.RPC_URL = _.isEmpty(process.env.RPC_URL)
    ? 'https://mainnet.infura.io/v3/53859557992b4896a7ee8cc0292b7526'
    : assertEnvVarType('RPC_URL', process.env.RPC_URL, EnvVarType.Url);
// Address used when simulating transfers from the maker as part of 0x order validation
exports.DEFAULT_TAKER_SIMULATION_ADDRESS = '0x709453D46915C562d88CEC34fA948ed7519c190f';
// A time window after which the order is considered permanently expired
exports.ORDER_SHADOWING_MARGIN_MS = 100 * 1000; // tslint:disable-line custom-no-magic-numbers
// Frequency of checks for permanently expired orders
exports.PERMANENT_CLEANUP_INTERVAL_MS = 10 * 1000; // tslint:disable-line custom-no-magic-numbers
// Max number of entities per page
exports.MAX_PER_PAGE = 1000;
// Default ERC20 token precision
exports.DEFAULT_ERC20_TOKEN_PRECISION = 18;
function assertEnvVarType(name, value, expectedType) {
    let returnValue;
    switch (expectedType) {
        case EnvVarType.Port:
            try {
                returnValue = parseInt(value, 10);
                const isWithinRange = returnValue >= 0 && returnValue <= 65535;
                if (!isWithinRange) {
                    throw new Error();
                }
            } catch (err) {
                throw new Error(`${name} must be between 0 to 65535, found ${value}.`);
            }
            return returnValue;
        case EnvVarType.NetworkId:
            try {
                returnValue = parseInt(value, 10);
            } catch (err) {
                throw new Error(`${name} must be a valid integer, found ${value}.`);
            }
            return returnValue;
        case EnvVarType.FeeRecipient:
            assert_1.assert.isETHAddressHex(name, value);
            return value;
        case EnvVarType.Url:
            assert_1.assert.isUri(name, value);
            return value;
        case EnvVarType.UnitAmount:
            try {
                returnValue = new _0x_js_1.BigNumber(parseFloat(value));
                if (returnValue.isNegative()) {
                    throw new Error();
                }
            } catch (err) {
                throw new Error(`${name} must be valid number greater than 0.`);
            }
            return returnValue;
        case EnvVarType.WhitelistAllTokens:
            return '*';
        default:
            throw new Error(`Unrecognised EnvVarType: ${expectedType} encountered for variable ${name}.`);
    }
}
function getDefaultFeeRecipient() {
    const metadata = JSON.parse(fs.readFileSync(metadataPath).toString());
    const existingDefault = metadata.DEFAULT_FEE_RECIPIENT;
    const newDefault = existingDefault || `0xabcabc${crypto.randomBytes(17).toString('hex')}`;
    if (_.isEmpty(existingDefault)) {
        const metadataCopy = JSON.parse(JSON.stringify(metadata));
        metadataCopy.DEFAULT_FEE_RECIPIENT = newDefault;
        fs.writeFileSync(metadataPath, JSON.stringify(metadataCopy));
    }
    return newDefault;
}
