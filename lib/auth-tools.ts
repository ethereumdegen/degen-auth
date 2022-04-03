import MongoInterface, { ChallengeTokenModel } from "./mongo-interface";
import web3utils from 'web3-utils'


const NODE_ENV = process.env.NODE_ENV

export default class AuthTools {

    static async initializeDatabase(mongoInterface:MongoInterface, config: any ){

      let envName = NODE_ENV ? NODE_ENV : 'unknown'

      let dbName = config.dbName ? config.dbName :  "degenauth".concat('_').concat(envName)
 
      await mongoInterface.init(dbName, config)

    }

    static generateServiceNameChallengePhrase(serviceName:string, publicAddress: string){
        
      let unixTime = Date.now().toString() 
      
      publicAddress = web3utils.toChecksumAddress(publicAddress)

      const accessChallenge = `Signing in to ${serviceName} as ${publicAddress.toString()} at ${unixTime.toString()}`

      return accessChallenge
    }
    
    static async saveChallengeForAccount( challenge: string, publicAddress:string )   {

      publicAddress = web3utils.toChecksumAddress(publicAddress)
  
      let insert = await ChallengeTokenModel.insertMany([ { publicAddress, challenge } ])

      return insert 
    }





}
  