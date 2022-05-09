
import ExtensibleMongoDatabase, { DatabaseExtension, RegisteredModel } from 'extensible-mongoose'


import {
 
    Schema,
    UpdateQuery,
  } from 'mongoose'
  


export interface AuthUser {
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



export const AuthUserSchema = new Schema<AuthUser>({
    
  publicAddress: { type: String, index: true, unique: true },
})

export const  ChallengeTokenSchema = new Schema<ChallengeToken>({
  challenge: { type: String },
  publicAddress: { type: String, index: true, unique: true },
  createdAt: Number,
})

export const  AuthenticationTokenSchema = new Schema<AuthenticationToken>({
  token: { type: String },
  publicAddress: { type: String, index: true, unique: true },
  createdAt: Number,
})


export default class DegenAuthExtension extends DatabaseExtension {

  
    constructor(mongoDatabase:ExtensibleMongoDatabase){
      super(mongoDatabase)       
  }

  getBindableModels() : Array<RegisteredModel>{

      return [
          {tableName:'authusers',schema:AuthUserSchema},
          {tableName:'challengetokens',schema:ChallengeTokenSchema},
          {tableName:'authenticationtokens',schema:AuthenticationTokenSchema}
      ]
  }


   
}
