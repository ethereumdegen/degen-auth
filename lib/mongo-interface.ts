
import {
    AnyKeys,
    connect,
    FilterQuery,
    Mongoose,
    Schema,
    UpdateQuery,
  } from 'mongoose'
  
const mongoose = new Mongoose()

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

const UserSchema = new Schema<User>({
    
  publicAddress: { type: String, index: true, unique: true },
})

const ChallengeTokenSchema = new Schema<ChallengeToken>({
  challenge: { type: String },
  publicAddress: { type: String, index: true, unique: true },
  createdAt: Number,
})

const AuthenticationTokenSchema = new Schema<AuthenticationToken>({
  token: { type: String },
  publicAddress: { type: String, index: true, unique: true },
  createdAt: Number,
})

export const UserModel = mongoose.model<User>('users', UserSchema)

export const ChallengeTokenModel = mongoose.model<ChallengeToken>(
  'challengetokens',
  ChallengeTokenSchema
)
export const AuthenticationTokenModel = mongoose.model<AuthenticationToken>(
  'authenticationtokens',
  AuthenticationTokenSchema
)

export default class MongoInterface {
  async init(dbName: string, config: any) {
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
    await mongoose.connect(url, {})
    console.log('connected to ', url, dbName)
  }

  async dropDatabase() {
    await mongoose.connection.db.dropDatabase()
  }
}
