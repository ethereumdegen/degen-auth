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
const auth_tools_1 = __importDefault(require("../lib/auth-tools"));
const mongo_interface_1 = __importDefault(require("../lib/mongo-interface"));
const ethers_1 = require("ethers");
(0, chai_1.should)();
let user;
let otherUser;
chai_1.should;
describe('Authentication', () => {
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        const mongoInterface = new mongo_interface_1.default();
        yield auth_tools_1.default.initializeDatabase(mongoInterface, {});
        yield mongoInterface.dropDatabase();
        let mnemonicPhrase = "blossom spatial metal assault riot bullet truck update forward brave slide way";
        user = ethers_1.Wallet.fromMnemonic(mnemonicPhrase, `m/44'/60'/0'/0/0`);
        otherUser = ethers_1.Wallet.fromMnemonic(mnemonicPhrase, `m/44'/60'/0'/0/1`);
    }));
    it('can generate a challenge', () => __awaiter(void 0, void 0, void 0, function* () {
        let publicAddress = user.address;
        let serviceChallenge = auth_tools_1.default.generateServiceNameChallengePhrase(Date.now().toString(), 'testApp', publicAddress);
        (0, chai_1.expect)(serviceChallenge).to.exist;
    }));
    it('can save a challenge', () => __awaiter(void 0, void 0, void 0, function* () {
        let publicAddress = user.address;
        let savedRecords = yield auth_tools_1.default.upsertNewChallengeNumberForAccount(publicAddress, 'testApp');
        let activeChallenge = yield auth_tools_1.default.findActiveChallengeForAccount(publicAddress);
        (0, chai_1.expect)(activeChallenge).to.exist;
    }));
    it('can validate personal signature', () => __awaiter(void 0, void 0, void 0, function* () {
        let activeChallenge = yield auth_tools_1.default.findActiveChallengeForAccount(user.address);
        if (!activeChallenge)
            throw ('Could not get active challenge');
        let goodSignature = yield user.signMessage(activeChallenge.challenge);
        let validation = auth_tools_1.default.validatePersonalSignature(user.address, goodSignature, activeChallenge.challenge);
        (0, chai_1.expect)(validation).to.eql(true);
    }));
    it('can reject bad personal signature', () => __awaiter(void 0, void 0, void 0, function* () {
        let activeChallenge = yield auth_tools_1.default.findActiveChallengeForAccount(user.address);
        if (!activeChallenge)
            throw ('Could not get active challenge');
        let badSignature = yield user.signMessage('improper message');
        let validation = auth_tools_1.default.validatePersonalSignature(user.address, badSignature, activeChallenge.challenge);
        (0, chai_1.expect)(validation).to.eql(false);
    }));
    it('can generate auth session', () => __awaiter(void 0, void 0, void 0, function* () {
        let activeChallenge = yield auth_tools_1.default.findActiveChallengeForAccount(user.address);
        if (!activeChallenge)
            throw ('Could not get active challenge');
        let goodSignature = yield user.signMessage(activeChallenge.challenge);
        let session = yield auth_tools_1.default.generateAuthenticatedSession(user.address, goodSignature);
        console.log('session', session);
        (0, chai_1.expect)(session.success).to.eql(true);
        (0, chai_1.expect)(session.authToken).to.exist;
    }));
    /*
  
      it('can get challenge token and auth token', async () => {
      let inputData = {publicAddress: user.address}
      let challengeResult = await axios.post( uri_root + '/api/get-challenge-token' , inputData )
    
      challengeResult.should.exist
      console.log('challenge token is ', challengeResult.data )
  
  
      let badSignature = '0x0000'
  
      let badAuthInputData = {publicAddress: user.address, signature: badSignature}
      let badAuthResult = await axios.post( uri_root + '/api/get-auth-token' , badAuthInputData )
        
      expect(badAuthResult.data.success).to.eql(false)
  
      let goodSignature = await user.signMessage( challengeResult.data.challengeToken )
  
      console.log('signature is', goodSignature)
      goodSignature.should.exist
  
      let authInputData = {publicAddress: user.address, signature: goodSignature}
      let authResult = await axios.post( uri_root + '/api/get-auth-token' , authInputData )
      authResult.should.exist
  
      console.log('auth token is ', authResult.data )
  
      let authTokenData = authResult.data.authToken
      authToken = authTokenData.token
  
      expect(authResult.data.success).to.eql(true)
    })
  
    */
});
//# sourceMappingURL=auth.test.js.map