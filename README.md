#### Degen Auth

Authentication library for web3 enabled applications



#### How to Use 

1) When a user requests to sign in via web3 with a particular publicAddress, a request is made to your backend which then will call AuthTools.upsertNewChallengeForAccount(publicAddress) .

2. This returns a challenge phrase which your backend will pass back to the frontend in that same call.  The frontend will make metamask request a PersonalSign with that challenge as the message and await the users signature.

3. Once the user signs in metamask, that signature and the users publicAddress will be the input for a request to your backend which calls AuthTools.generateAuthenticatedSession(publicAddress, signature).   This will return an authentication token (random hex string) which will be passed back to the user and will be stored in their localStorage, valid for up to 24 hours.   

4. This user can now use this authentication token for your other api requests .  These can require than the authentication token be given to prove that the user has, in the recent past, proven that they know the private key for that public address.   

