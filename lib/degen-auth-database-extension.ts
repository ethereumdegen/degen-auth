
import ExtensibleMongoDatabase, { DatabaseExtension, RegisteredModel, TableDefinition } from 'extensible-mongoose'


import {
 
    Schema,
    UpdateQuery,
  } from 'mongoose'
  

 

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

export const ChallengeTokenDefinition:TableDefinition={
  tableName:'challengetokens',schema:ChallengeTokenSchema
}


export const AuthenticationTokenDefinition:TableDefinition={
  tableName:'authenticationtokens',schema:ChallengeTokenSchema
}

export class DegenAuthExtension extends DatabaseExtension {

  
  constructor(mongoDatabase:ExtensibleMongoDatabase){
      super(mongoDatabase)       
  }

  getBindableModels() : Array<TableDefinition>{

      return [
          
        ChallengeTokenDefinition,
        AuthenticationTokenDefinition
      ]
  }


   
}
