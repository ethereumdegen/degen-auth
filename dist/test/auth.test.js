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
const chai_1 = require("chai");
const index_1 = __importDefault(require("../index"));
const ethers_1 = require("ethers");
const extensible_mongoose_1 = __importDefault(require("extensible-mongoose"));
const degen_auth_database_extension_1 = __importDefault(require("../lib/degen-auth-database-extension"));
(0, chai_1.should)();
let mongoInterface;
let user;
let otherUser;
chai_1.should;
describe('Authentication', () => {
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        mongoInterface = new extensible_mongoose_1.default();
        yield mongoInterface.init('auth_test_db');
        let degenAuthExtension = new degen_auth_database_extension_1.default(mongoInterface);
        degenAuthExtension.bindModelsToDatabase();
        yield mongoInterface.dropDatabase();
        user = ethers_1.Wallet.createRandom();
        otherUser = ethers_1.Wallet.createRandom();
    }));
    it('can generate a challenge', () => __awaiter(void 0, void 0, void 0, function* () {
        let publicAddress = user.address;
        let serviceChallenge = index_1.default.generateServiceNameChallengePhrase(Date.now().toString(), 'testApp', publicAddress);
        (0, chai_1.expect)(serviceChallenge).to.exist;
    }));
    it('can save a challenge', () => __awaiter(void 0, void 0, void 0, function* () {
        let publicAddress = user.address;
        let savedRecords = yield index_1.default.upsertNewChallengeForAccount(mongoInterface, publicAddress, 'testApp');
        let activeChallenge = yield index_1.default.findActiveChallengeForAccount(mongoInterface, publicAddress);
        (0, chai_1.expect)(activeChallenge).to.exist;
    }));
    it('can validate personal signature', () => __awaiter(void 0, void 0, void 0, function* () {
        let activeChallenge = yield index_1.default.findActiveChallengeForAccount(mongoInterface, user.address);
        if (!activeChallenge)
            throw ('Could not get active challenge');
        let goodSignature = yield user.signMessage(activeChallenge.challenge);
        let validation = index_1.default.validatePersonalSignature(user.address, goodSignature, activeChallenge.challenge);
        (0, chai_1.expect)(validation).to.eql(true);
    }));
    it('can reject bad personal signature', () => __awaiter(void 0, void 0, void 0, function* () {
        let activeChallenge = yield index_1.default.findActiveChallengeForAccount(mongoInterface, user.address);
        if (!activeChallenge)
            throw ('Could not get active challenge');
        let badSignature = yield user.signMessage('improper message');
        let validation = index_1.default.validatePersonalSignature(user.address, badSignature, activeChallenge.challenge);
        (0, chai_1.expect)(validation).to.eql(false);
    }));
    it('can generate auth session', () => __awaiter(void 0, void 0, void 0, function* () {
        let activeChallenge = yield index_1.default.findActiveChallengeForAccount(mongoInterface, user.address);
        if (!activeChallenge)
            throw ('Could not get active challenge');
        let goodSignature = yield user.signMessage(activeChallenge.challenge);
        let session = yield index_1.default.generateAuthenticatedSession(mongoInterface, user.address, goodSignature);
        console.log('session', session);
        (0, chai_1.expect)(session.success).to.eql(true);
        (0, chai_1.expect)(session.authToken).to.exist;
    }));
});
//# sourceMappingURL=auth.test.js.map