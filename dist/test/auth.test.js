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
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = require("../index");
const ethers_1 = require("ethers");
(0, chai_1.should)();
let mongoInterface;
let user;
let otherUser;
chai_1.should;
describe('Authentication', () => {
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        mongoInterface = yield index_1.AuthTools.initializeDatabase({});
        yield mongoInterface.dropDatabase();
        let mnemonicPhrase = "blossom spatial metal assault riot bullet truck update forward brave slide way";
        user = ethers_1.Wallet.fromMnemonic(mnemonicPhrase, `m/44'/60'/0'/0/0`);
        otherUser = ethers_1.Wallet.fromMnemonic(mnemonicPhrase, `m/44'/60'/0'/0/1`);
    }));
    it('can generate a challenge', () => __awaiter(void 0, void 0, void 0, function* () {
        let publicAddress = user.address;
        let serviceChallenge = index_1.AuthTools.generateServiceNameChallengePhrase(Date.now().toString(), 'testApp', publicAddress);
        (0, chai_1.expect)(serviceChallenge).to.exist;
    }));
    it('can save a challenge', () => __awaiter(void 0, void 0, void 0, function* () {
        let publicAddress = user.address;
        let savedRecords = yield index_1.AuthTools.upsertNewChallengeForAccount(mongoInterface, publicAddress, 'testApp');
        let activeChallenge = yield index_1.AuthTools.findActiveChallengeForAccount(mongoInterface, publicAddress);
        (0, chai_1.expect)(activeChallenge).to.exist;
    }));
    it('can validate personal signature', () => __awaiter(void 0, void 0, void 0, function* () {
        let activeChallenge = yield index_1.AuthTools.findActiveChallengeForAccount(mongoInterface, user.address);
        if (!activeChallenge)
            throw ('Could not get active challenge');
        let goodSignature = yield user.signMessage(activeChallenge.challenge);
        let validation = index_1.AuthTools.validatePersonalSignature(user.address, goodSignature, activeChallenge.challenge);
        (0, chai_1.expect)(validation).to.eql(true);
    }));
    it('can reject bad personal signature', () => __awaiter(void 0, void 0, void 0, function* () {
        let activeChallenge = yield index_1.AuthTools.findActiveChallengeForAccount(mongoInterface, user.address);
        if (!activeChallenge)
            throw ('Could not get active challenge');
        let badSignature = yield user.signMessage('improper message');
        let validation = index_1.AuthTools.validatePersonalSignature(user.address, badSignature, activeChallenge.challenge);
        (0, chai_1.expect)(validation).to.eql(false);
    }));
    it('can generate auth session', () => __awaiter(void 0, void 0, void 0, function* () {
        let activeChallenge = yield index_1.AuthTools.findActiveChallengeForAccount(mongoInterface, user.address);
        if (!activeChallenge)
            throw ('Could not get active challenge');
        let goodSignature = yield user.signMessage(activeChallenge.challenge);
        let session = yield index_1.AuthTools.generateAuthenticatedSession(mongoInterface, user.address, goodSignature);
        console.log('session', session);
        (0, chai_1.expect)(session.success).to.eql(true);
        (0, chai_1.expect)(session.authToken).to.exist;
    }));
});
//# sourceMappingURL=auth.test.js.map