import MongoInterface, { AuthenticationTokenModel, ChallengeTokenModel } from "./mongo-interface";
import web3utils from 'web3-utils'

import crypto from 'crypto'

import {bufferToHex, toBuffer, hashPersonalMessage, fromRpcSig, ecrecover, pubToAddress} from 'ethereumjs-util'



const NODE_ENV = process.env.NODE_ENV

export default class AuthTools {

    static getEnvironmentName() : string{
      let envName = NODE_ENV ? NODE_ENV : 'unknown'

      return envName
    }

    static async initializeDatabase(mongoInterface:MongoInterface, config: any ){
 

      let dbName = config.dbName ? config.dbName :  "degenauth".concat('_').concat(AuthTools.getEnvironmentName())
 
      await mongoInterface.init(dbName, config)

    }

    static generateServiceNameChallengePhrase(unixTime:string, serviceName:string, publicAddress: string){
        
      
      publicAddress = web3utils.toChecksumAddress(publicAddress)

      const accessChallenge = `Signing in to ${serviceName} as ${publicAddress.toString()} at ${unixTime.toString()}`

      return accessChallenge
    }
    
    static async upsertNewChallengeNumberForAccount(publicAddress:string, serviceName: string, challengeGenerator?: Function )   {

      const unixTime = Date.now().toString()
      
      publicAddress = web3utils.toChecksumAddress(publicAddress)
  
      let challenge;

      if(challengeGenerator){
        challenge = challengeGenerator( unixTime, serviceName, publicAddress )
      }else{
        challenge = AuthTools.generateServiceNameChallengePhrase(  unixTime, serviceName, publicAddress)
      }

      const existingChallengeToken = await AuthTools.findActiveChallengeForAccount(publicAddress) 


      let upsert;

      if (existingChallengeToken) {
        upsert = await ChallengeTokenModel.updateOne(
          { publicAddress: publicAddress },
          { challenge: challenge, createdAt: unixTime }
        )
      } else {
        upsert = await ChallengeTokenModel.insertMany({
          publicAddress: publicAddress,
          challenge: challenge,
          createdAt: unixTime,
        })
      }
      return upsert 
    }



    static async findActiveChallengeForAccount(publicAddress: string) {
      const ONE_DAY = 86400 * 1000
  
      const existingChallengeToken = await ChallengeTokenModel.findOne({
        publicAddress: publicAddress,
        createdAt: { $gt: Date.now() - ONE_DAY },
      })
  
      return existingChallengeToken
    }

    static generateNewAuthenticationToken() {
      return crypto.randomBytes(16).toString('hex')
    }

    static async findActiveAuthenticationTokenForAccount(publicAddress: string) {
      const ONE_DAY = 86400 * 1000
  
      publicAddress = web3utils.toChecksumAddress(publicAddress)
  
      const existingAuthToken = await AuthenticationTokenModel.findOne({
        publicAddress: publicAddress,
        createdAt: { $gt: Date.now() - ONE_DAY },
      })
  
      return existingAuthToken
    }

    static async upsertNewAuthenticationTokenForAccount(publicAddress: string) {
      const unixTime = Date.now().toString()
  
      const newToken = AuthTools.generateNewAuthenticationToken()
  
      publicAddress = web3utils.toChecksumAddress(publicAddress)
  
      const existingAuthToken = await AuthTools.findActiveAuthenticationTokenForAccount(publicAddress)
      
      let upsert 
      if (existingAuthToken) {
        upsert = await AuthenticationTokenModel.updateOne(
          { publicAddress: publicAddress },
          { token: newToken, createdAt: unixTime }
        )
      } else {
        upsert = await AuthenticationTokenModel.insertMany({
          publicAddress: publicAddress,
          token: newToken,
          createdAt: unixTime,
        })
      }
  
      return upsert
    }




    static async validateAuthenticationTokenForAccount(
      publicAddress: string,
      authToken: string
    ) {
      //always validate if in dev mode
      if (AuthTools.getEnvironmentName() == 'development') {
        return true
      }
  
      const ONE_DAY = 86400 * 1000
  
      publicAddress = web3utils.toChecksumAddress(publicAddress)
  
      const existingAuthToken = await AuthenticationTokenModel.findOne({
        publicAddress: publicAddress,
        token: authToken,
        createdAt: { $gt: Date.now() - ONE_DAY },
      })
  
      return existingAuthToken
    }
  
    static validatePersonalSignature(
      fromAddress: string,
      signature: string,
      challenge: string,
      signedAt: number
    ) {
      //let challenge = 'Signing for Etherpunks at '.concat(signedAt)
  
      let recoveredAddress = AuthTools.ethJsUtilecRecover(challenge, signature)
  
      if (!recoveredAddress) {
        console.log('mismatch address')
        return false
      }
  
      recoveredAddress = web3utils.toChecksumAddress(recoveredAddress)
  
      if (recoveredAddress != web3utils.toChecksumAddress(fromAddress)) {
        console.log('mismatch address')
        return false
      }
  
      const ONE_DAY = 1000 * 60 * 60 * 24
  
      if (signedAt < Date.now() - ONE_DAY) {
        return false
      }
  
      return true
    }
  
    static ethJsUtilecRecover(msg: string, signature: string) {
         
      try{
        const res = fromRpcSig(signature)
  
        const msgHash = hashPersonalMessage(Buffer.from(msg))
  
        const pubKey = ecrecover(
          toBuffer(msgHash),
          res.v,
          res.r,
          res.s
        )
        const addrBuf = pubToAddress(pubKey)
        const recoveredSignatureSigner = bufferToHex(addrBuf)
        console.log('rec:', recoveredSignatureSigner)
  
        return recoveredSignatureSigner
  
      }catch(e){
        console.error(e)
  
      }
  
      return null 
    }
  


}

  