// TODO-DONE: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'g22acgj1ug'
export const apiEndpoint = `https://${apiId}.execute-api.eu-west-1.amazonaws.com/dev`

export const authConfig = {
  // TODO-DONE: Create an Auth0 application and copy values from it into this map
  domain: 'dev-pwtgtc52.eu.auth0.com',            // Auth0 domain
  clientId: '3DSbz92texEVW6qlxBOXUAwHaOU2GF3q',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
