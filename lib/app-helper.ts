 
 


const NODE_ENV = process.env.NODE_ENV



export default class AppHelper  {

  static getEnvironmentName() : string{
    let envName = NODE_ENV ? NODE_ENV : 'development'

    return envName
  }

    
        
      
}