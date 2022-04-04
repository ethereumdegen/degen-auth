
import {
    AnyKeys,
    connect,
    FilterQuery,
    Mongoose,
    Schema,
    UpdateQuery,
  } from 'mongoose'
  


export interface User {
  publicAddress: string
}

export interface ChallengeToken {
  challenge: string
  publicAddress: string
  createdAt: number
}

export interface AuthenticationToken {
  token: string
  publicAddress: string
  createdAt: number
}


export default class MongoInterface {


  mongoose = new Mongoose()

  UserSchema = new Schema<User>({
    
    publicAddress: { type: String, index: true, unique: true },
  })
  
  ChallengeTokenSchema = new Schema<ChallengeToken>({
    challenge: { type: String },
    publicAddress: { type: String, index: true, unique: true },
    createdAt: Number,
  })
  
  AuthenticationTokenSchema = new Schema<AuthenticationToken>({
    token: { type: String },
    publicAddress: { type: String, index: true, unique: true },
    createdAt: Number,
  })
  
  UserModel = this.mongoose.model<User>('users', this.UserSchema)
  
  ChallengeTokenModel = this.mongoose.model<ChallengeToken>(
    'challengetokens',
    this.ChallengeTokenSchema
  )
  AuthenticationTokenModel = this.mongoose.model<AuthenticationToken>(
    'authenticationtokens',
    this.AuthenticationTokenSchema
  )


  async init(dbName: string, config?: any) {
    let host = 'localhost'
    let port = 27017

    if (config && config.url) {
      host = config.url
    }
    if (config && config.port) {
      port = config.port
    }

    if (dbName == null) {
      console.log('WARNING: No dbName Specified')
      process.exit()
    }

    const url = 'mongodb://' + host + ':' + port + '/' + dbName
    await this.mongoose.connect(url, {})
    console.log('connected to ', url, dbName)
  }

  async dropDatabase() {
    await this.mongoose.connection.db.dropDatabase()
  }
}
