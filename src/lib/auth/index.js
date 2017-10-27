var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
import credentials from './client_secret.json';
import Promise from 'bluebird'; 


// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/drive-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.file'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';

export function authorize() {
  
  return new Promise( (resolve, reject) => {

    var clientSecret = credentials.installed.client_secret,
    		clientId = credentials.installed.client_id,
    		redirectUrl = credentials.installed.redirect_uris[0],
    		auth = new googleAuth(),
    		oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {

      if (err) {
        getNewToken(oauth2Client)
        .then( (newAuth) => {
          resolve(newAuth);
        })
        .catch( (error) => {
          reject(error);
        });

      } else {
        oauth2Client.credentials = JSON.parse(token);
        resolve(oauth2Client);
      }

    });

  });

};

const getNewToken = (oauth2Client) => {

  return new Promise( (resolve, reject) => {

    // authorize app through console
    var authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });

    // tell the user to get the auth code
    console.log('Authorize this app by visiting this url: ', authUrl);

    // initiate console input
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // ask for the code
    rl.question('Enter the code from that page here: ', function(code) {
      rl.close();

      // get the token
      oauth2Client.getToken(code, function(err, token) {

        if (err) {
          console.log('Error while trying to retrieve access token', err);
          reject(err);
          return;
        }

        oauth2Client.credentials = token;
        storeToken(token);
        resolve(oauth2Client);
      });
    });

  });
};

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
const storeToken = (token) => {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

