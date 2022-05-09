
//import MongoInterface from "./lib/degen-auth-database-extension";
import web3utils from 'web3-utils'

import crypto from 'crypto'

import {bufferToHex, toBuffer, hashPersonalMessage, fromRpcSig, ecrecover, pubToAddress} from 'ethereumjs-util'

import AppHelper from "./lib/app-helper";

import ExtensibleMongooseDatabase from "extensible-mongoose";

const NODE_ENV = process.env.NODE_ENV


 



export default class DegenAuth {

    constructor(public mongoDB: ExtensibleMongooseDatabase){

    }
    
 
    static generateServiceNameChallengePhrase(unixTime:string, serviceName:string, publicAddress: string){
        
      
      publicAddress = web3utils.toChecksumAddress(publicAddress)

      const accessChallenge = `Signing in to ${serviceName} as ${publicAddress.toString()} at ${unixTime.toString()}`

      return accessChallenge
    }
    
    static async upsertNewChallengeForAccount(mongoInterface:ExtensibleMongooseDatabase, publicAddress:string, serviceName: string, challengeGenerator?: Function )   {

      const unixTime = Date.now().toString()
      
      publicAddress = web3utils.toChecksumAddress(publicAddress)
  
      let challenge;

      if(challengeGenerator){
        challenge = challengeGenerator( unixTime, serviceName, publicAddress )
      }else{
        challenge = DegenAuth.generateServiceNameChallengePhrase(  unixTime, serviceName, publicAddress)
      }

     
      
      let upsert = await mongoInterface.getModel('challengetokens').findOneAndUpdate(
        { publicAddress: publicAddress },
        { challenge: challenge, createdAt: unixTime },
        {new:true, upsert:true }
      )
     
      
      return challenge 
    }



    static async findActiveChallengeForAccount(mongoDB:ExtensibleMongooseDatabase, publicAddress: string) {
      const ONE_DAY = 86400 * 1000

      publicAddress = web3utils.toChecksumAddress(publicAddress)
  
      const existingChallengeToken = await mongoDB.getModel('challengetokens').findOne({
        publicAddress: publicAddress,
        createdAt: { $gt: Date.now() - ONE_DAY },
      })
  
      return existingChallengeToken
    }

    static generateNewAuthenticationToken() {
      return crypto.randomBytes(16).toString('hex')
    }

    static async findActiveAuthenticationTokenForAccount(mongoDB:ExtensibleMongooseDatabase, publicAddress: string) {
      const ONE_DAY = 86400 * 1000
  
      publicAddress = web3utils.toChecksumAddress(publicAddress)
  
      const existingAuthToken = await mongoDB.getModel('authenticationtokens').findOne({
        publicAddress: publicAddress,
        createdAt: { $gt: Date.now() - ONE_DAY },
      })
  
      return existingAuthToken
    }

    static async upsertNewAuthenticationTokenForAccount(mongoDB:ExtensibleMongooseDatabase, publicAddress: string) {
      const unixTime = Date.now().toString()
  
      const newToken = DegenAuth.generateNewAuthenticationToken()
  
      publicAddress = web3utils.toChecksumAddress(publicAddress)
  
       let upsert = await mongoDB.getModel('authenticationtokens').findOneAndUpdate(
          { publicAddress: publicAddress },
          { token: newToken, createdAt: unixTime },
          {new:true, upsert:true }
        )
      
  
      return newToken
    }




    static async validateAuthenticationTokenForAccount(
      mongoDB:ExtensibleMongooseDatabase,
      publicAddress: string,
      authToken: string
    ) {
      //always validate if in dev mode
      if (AppHelper.getEnvironmentName() == 'development') {
        return true
      }
  
      const ONE_DAY = 86400 * 1000
  
      publicAddress = web3utils.toChecksumAddress(publicAddress)
  
      const existingAuthToken = await mongoDB.getModel('authenticationtokens').findOne({
        publicAddress: publicAddress,
        token: authToken,
        createdAt: { $gt: Date.now() - ONE_DAY },
      })
  
      return existingAuthToken
    }
    

    /*
    This method takes a public address and the users signature of the challenge which proves that they know the private key for the account without revealing the private key.
    If the signature is valid, then an authentication token is stored in the database and returned by this method so that it can be given to the user and stored on their client side as their session token.
    Then, anyone with that session token can reasonably be trusted to be fully in control of the web3 account for that public address since they were able to personal sign. 
    */
    static async generateAuthenticatedSession(mongoDB:ExtensibleMongooseDatabase, publicAddress:string, signature:string, challenge?:string){
      if(!challenge){
        let challengeRecord = await DegenAuth.findActiveChallengeForAccount(mongoDB,publicAddress)
          
        if(challengeRecord){
        challenge = challengeRecord.challenge
        }
      }

      if(!challenge){
        return {success:false, error:'no active challenge found for user'} 
      }

      let validation = DegenAuth.validatePersonalSignature(publicAddress,signature,challenge)

      if(!validation){
        return {success:false, error:'signature validation failed'} 
      }

      let authToken = await DegenAuth.upsertNewAuthenticationTokenForAccount(mongoDB,publicAddress)

      return {success:true, authToken: authToken} 

    }

    static validatePersonalSignature(
      fromAddress: string,
      signature: string,
      challenge: string,
      signedAt?: number
    ) {

      if(!signedAt) signedAt = Date.now()
      //let challenge = 'Signing for Etherpunks at '.concat(signedAt)
  
      let recoveredAddress = DegenAuth.ethJsUtilecRecover(challenge, signature)
  
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

  