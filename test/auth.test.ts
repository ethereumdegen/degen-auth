import { expect, should } from 'chai'
import fs from 'fs'
import path from 'path'
 
import AuthTools from '../lib/auth-tools'
import MongoInterface from '../lib/mongo-interface'

 
should()
  
describe('Authentication', () => {
 
  before(async () => {

    const mongoInterface = new MongoInterface()
 

    await AuthTools.initializeDatabase(mongoInterface, {})

    await mongoInterface.dropDatabase()

  })
  
  it('can generate a challenge', async () => {

    let publicAddress = "0xB11ca87E32075817C82Cc471994943a4290f4a14"

    let serviceChallenge = AuthTools.generateServiceNameChallengePhrase('testApp', publicAddress)
    
    expect(serviceChallenge).to.exist
  })

    
  it('can save a challenge', async () => {

    let publicAddress = "0xB11ca87E32075817C82Cc471994943a4290f4a14"

    let serviceChallenge = AuthTools.generateServiceNameChallengePhrase('testApp', publicAddress)

    let savedRecords = await AuthTools.saveChallengeForAccount( serviceChallenge, publicAddress )

    
    expect(savedRecords[0].challenge).to.exist
  })

 

 

})
