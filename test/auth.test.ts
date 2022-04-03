import { expect, should } from 'chai'
import fs from 'fs'
import path from 'path'
 
import AuthTools from '../lib/auth-tools'
import MongoInterface from '../lib/mongo-interface'

import   { Contract, Signer, Wallet } from 'ethers'


 
should()
  

let user:Wallet 
let otherUser:Wallet
should
describe('Authentication', () => {
 
  before(async () => {

    const mongoInterface = new MongoInterface()
 

    await AuthTools.initializeDatabase(mongoInterface, {})

    await mongoInterface.dropDatabase()

    let mnemonicPhrase = "blossom spatial metal assault riot bullet truck update forward brave slide way"

    user =  Wallet.fromMnemonic(mnemonicPhrase!, `m/44'/60'/0'/0/0`)
    otherUser =  Wallet.fromMnemonic(mnemonicPhrase!, `m/44'/60'/0'/0/1`)
    

  })
  
  it('can generate a challenge', async () => {

    let publicAddress = user.address

    let serviceChallenge = AuthTools.generateServiceNameChallengePhrase(Date.now().toString(), 'testApp', publicAddress)
    
    expect(serviceChallenge).to.exist
  })

    
  it('can save a challenge', async () => {

    let publicAddress = user.address
     
    let savedRecords = await AuthTools.upsertNewChallengeForAccount( publicAddress,  'testApp' )
    
    let activeChallenge = await AuthTools.findActiveChallengeForAccount(publicAddress)

    expect(activeChallenge).to.exist


  })


  it('can validate personal signature', async () => {

    let activeChallenge = await AuthTools.findActiveChallengeForAccount(user.address)

    if(!activeChallenge) throw('Could not get active challenge')

    let goodSignature = await user.signMessage( activeChallenge.challenge )

    let validation = AuthTools.validatePersonalSignature(user.address,goodSignature,activeChallenge.challenge)

    expect(validation).to.eql(true)

  })


  it('can reject bad personal signature', async () => {

    let activeChallenge = await AuthTools.findActiveChallengeForAccount(user.address)

    if(!activeChallenge) throw('Could not get active challenge')

    let badSignature = await user.signMessage( 'improper message' )

    let validation = AuthTools.validatePersonalSignature(user.address,badSignature,activeChallenge.challenge)

    expect(validation).to.eql(false)

  })


  it('can generate auth session', async () => {

    let activeChallenge = await AuthTools.findActiveChallengeForAccount(user.address)

    if(!activeChallenge) throw('Could not get active challenge')

    let goodSignature = await user.signMessage( activeChallenge.challenge )

    let session = await AuthTools.generateAuthenticatedSession(user.address,goodSignature)

    console.log('session',session)

    expect(session.success).to.eql(true)

    expect(session.authToken).to.exist

  })

 


 

 

})
