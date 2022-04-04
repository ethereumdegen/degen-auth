"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongo_interface_1 = __importDefault(require("./mongo-interface"));
const web3_utils_1 = __importDefault(require("web3-utils"));
const crypto_1 = __importDefault(require("crypto"));
const ethereumjs_util_1 = require("ethereumjs-util");
const NODE_ENV = process.env.NODE_ENV;
class AuthTools {
    static getEnvironmentName() {
        let envName = NODE_ENV ? NODE_ENV : 'unknown';
        return envName;
    }
    static initializeDatabase(config) {
        return __awaiter(this, void 0, void 0, function* () {
            let mongoInterface = new mongo_interface_1.default();
            if (!config)
                config = {};
            let dbName = config.dbName ? config.dbName : "degenauth".concat('_').concat(AuthTools.getEnvironmentName());
            yield mongoInterface.init(dbName, config);
            return mongoInterface;
        });
    }
    static generateServiceNameChallengePhrase(unixTime, serviceName, publicAddress) {
        publicAddress = web3_utils_1.default.toChecksumAddress(publicAddress);
        const accessChallenge = `Signing in to ${serviceName} as ${publicAddress.toString()} at ${unixTime.toString()}`;
        return accessChallenge;
    }
    static upsertNewChallengeForAccount(mongoInterface, publicAddress, serviceName, challengeGenerator) {
        return __awaiter(this, void 0, void 0, function* () {
            const unixTime = Date.now().toString();
            publicAddress = web3_utils_1.default.toChecksumAddress(publicAddress);
            let challenge;
            if (challengeGenerator) {
                challenge = challengeGenerator(unixTime, serviceName, publicAddress);
            }
            else {
                challenge = AuthTools.generateServiceNameChallengePhrase(unixTime, serviceName, publicAddress);
            }
            let upsert = yield mongoInterface.ChallengeTokenModel.findOneAndUpdate({ publicAddress: publicAddress }, { challenge: challenge, createdAt: unixTime }, { new: true, upsert: true });
            return challenge;
        });
    }
    static findActiveChallengeForAccount(mongoInterface, publicAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const ONE_DAY = 86400 * 1000;
            publicAddress = web3_utils_1.default.toChecksumAddress(publicAddress);
            const existingChallengeToken = yield mongoInterface.ChallengeTokenModel.findOne({
                publicAddress: publicAddress,
                createdAt: { $gt: Date.now() - ONE_DAY },
            });
            return existingChallengeToken;
        });
    }
    static generateNewAuthenticationToken() {
        return crypto_1.default.randomBytes(16).toString('hex');
    }
    static findActiveAuthenticationTokenForAccount(mongoInterface, publicAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const ONE_DAY = 86400 * 1000;
            publicAddress = web3_utils_1.default.toChecksumAddress(publicAddress);
            const existingAuthToken = yield mongoInterface.AuthenticationTokenModel.findOne({
                publicAddress: publicAddress,
                createdAt: { $gt: Date.now() - ONE_DAY },
            });
            return existingAuthToken;
        });
    }
    static upsertNewAuthenticationTokenForAccount(mongoInterface, publicAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const unixTime = Date.now().toString();
            const newToken = AuthTools.generateNewAuthenticationToken();
            publicAddress = web3_utils_1.default.toChecksumAddress(publicAddress);
            let upsert = yield mongoInterface.AuthenticationTokenModel.findOneAndUpdate({ publicAddress: publicAddress }, { token: newToken, createdAt: unixTime }, { new: true, upsert: true });
            return newToken;
        });
    }
    static validateAuthenticationTokenForAccount(mongoInterface, publicAddress, authToken) {
        return __awaiter(this, void 0, void 0, function* () {
            //always validate if in dev mode
            if (AuthTools.getEnvironmentName() == 'development') {
                return true;
            }
            const ONE_DAY = 86400 * 1000;
            publicAddress = web3_utils_1.default.toChecksumAddress(publicAddress);
            const existingAuthToken = yield mongoInterface.AuthenticationTokenModel.findOne({
                publicAddress: publicAddress,
                token: authToken,
                createdAt: { $gt: Date.now() - ONE_DAY },
            });
            return existingAuthToken;
        });
    }
    /*
    This method takes a public address and the users signature of the challenge which proves that they know the private key for the account without revealing the private key.
    If the signature is valid, then an authentication token is stored in the database and returned by this method so that it can be given to the user and stored on their client side as their session token.
    Then, anyone with that session token can reasonably be trusted to be fully in control of the web3 account for that public address since they were able to personal sign.
    */
    static generateAuthenticatedSession(mongoInterface, publicAddress, signature, challenge) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!challenge) {
                let challengeRecord = yield AuthTools.findActiveChallengeForAccount(mongoInterface, publicAddress);
                if (challengeRecord) {
                    challenge = challengeRecord.challenge;
                }
            }
            if (!challenge) {
                return { success: false, error: 'no active challenge found for user' };
            }
            let validation = AuthTools.validatePersonalSignature(publicAddress, signature, challenge);
            if (!validation) {
                return { success: false, error: 'signature validation failed' };
            }
            let authToken = yield AuthTools.upsertNewAuthenticationTokenForAccount(mongoInterface, publicAddress);
            return { success: true, authToken: authToken };
        });
    }
    static validatePersonalSignature(fromAddress, signature, challenge, signedAt) {
        if (!signedAt)
            signedAt = Date.now();
        //let challenge = 'Signing for Etherpunks at '.concat(signedAt)
        let recoveredAddress = AuthTools.ethJsUtilecRecover(challenge, signature);
        if (!recoveredAddress) {
            console.log('mismatch address');
            return false;
        }
        recoveredAddress = web3_utils_1.default.toChecksumAddress(recoveredAddress);
        if (recoveredAddress != web3_utils_1.default.toChecksumAddress(fromAddress)) {
            console.log('mismatch address');
            return false;
        }
        const ONE_DAY = 1000 * 60 * 60 * 24;
        if (signedAt < Date.now() - ONE_DAY) {
            return false;
        }
        return true;
    }
    static ethJsUtilecRecover(msg, signature) {
        try {
            const res = (0, ethereumjs_util_1.fromRpcSig)(signature);
            const msgHash = (0, ethereumjs_util_1.hashPersonalMessage)(Buffer.from(msg));
            const pubKey = (0, ethereumjs_util_1.ecrecover)((0, ethereumjs_util_1.toBuffer)(msgHash), res.v, res.r, res.s);
            const addrBuf = (0, ethereumjs_util_1.pubToAddress)(pubKey);
            const recoveredSignatureSigner = (0, ethereumjs_util_1.bufferToHex)(addrBuf);
            console.log('rec:', recoveredSignatureSigner);
            return recoveredSignatureSigner;
        }
        catch (e) {
            console.error(e);
        }
        return null;
    }
}
exports.default = AuthTools;
//# sourceMappingURL=auth-tools.js.map