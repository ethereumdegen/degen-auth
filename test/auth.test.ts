import { expect, should } from 'chai'
import fs from 'fs'
import path from 'path'
 
import DegenAuth, {DegenAuthExtension} from '../index' 

import   { Contract, Signer, Wallet } from 'ethers'
import ExtensibleMongooseDatabase from 'extensible-mongoose'
 
 
should()
  
let mongoInterface: ExtensibleMongooseDatabase
let user:Wallet 
let otherUser:Wallet
should
describe('Authentication', () => {
 
  before(async () => {

    mongoInterface = new ExtensibleMongooseDatabase()
    await mongoInterface.init('auth_test_db')

    let degenAuthExtension = new DegenAuthExtension(mongoInterface)
    degenAuthExtension.bindModelsToDatabase()

    await mongoInterface.dropDatabase()


   
    user =  Wallet.createRandom()
    otherUser =  Wallet.createRandom()
    

  })
  
  it('can generate a challenge', async () => {

    let publicAddress = user.address

    let serviceChallenge = DegenAuth.generateServiceNameChallengePhrase(Date.now().toString(), 'testApp', publicAddress)
    
    expect(serviceChallenge).to.exist
  })

    
  it('can save a challenge', async () => {

    let publicAddress = user.address
     
    let savedRecords = await DegenAuth.upsertNewChallengeForAccount(mongoInterface, publicAddress,  'testApp' )
    
    let activeChallenge = await DegenAuth.findActiveChallengeForAccount(mongoInterface, publicAddress)

    expect(activeChallenge).to.exist


  })


  it('can validate personal signature', async () => {

    let activeChallenge = await DegenAuth.findActiveChallengeForAccount(mongoInterface, user.address)

    if(!activeChallenge) throw('Could not get active challenge')

    let goodSignature = await user.signMessage( activeChallenge.challenge )

    let validation = DegenAuth.validatePersonalSignature(user.address,goodSignature,activeChallenge.challenge)

    expect(validation).to.eql(true)

  })


  it('can reject bad personal signature', async () => {

    let activeChallenge = await DegenAuth.findActiveChallengeForAccount(mongoInterface, user.address)

    if(!activeChallenge) throw('Could not get active challenge')

    let badSignature = await user.signMessage( 'improper message' )

    let validation = DegenAuth.validatePersonalSignature(user.address,badSignature,activeChallenge.challenge)

    expect(validation).to.eql(false)

  })


  it('can generate auth session', async () => {

    let activeChallenge = await DegenAuth.findActiveChallengeForAccount(mongoInterface, user.address)

    if(!activeChallenge) throw('Could not get active challenge')

    let goodSignature = await user.signMessage( activeChallenge.challenge )

    let session = await DegenAuth.generateAuthenticatedSession(mongoInterface, user.address,goodSignature)

    console.log('session',session)

    expect(session.success).to.eql(true)

    expect(session.authToken).to.exist

  })

 


 

 

})
