//******
// * File establishes creates an Oauth client 
// * getInstallUrl() generate a redirect url to install app on user account
// * authorize() sets our credentials to be that user
// * createNewToken() generates a new access token when given a access code
//******

var fs = require('fs');
import googleAuth from 'google-auth-library';
import google from 'googleapis'
import credentials from './client_secret.json';
import Promise from 'bluebird'; 
import {storeToken, getToken} from '../../db.js'

var clientSecret = credentials.web.client_secret,
    clientId = credentials.web.client_id,
    redirectUrl = credentials.web.redirect_uris[0],
    auth = new googleAuth(),
    oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);



export function getUser(token) {
  
  return new Promise((resolve, reject) => {
      oauth2Client.credentials = token;
      
      var oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      
      oauth2.userinfo.get(function(err, response) {
        !err ? resolve(response) : reject(err);
      });

  });
}


export function getInstallUrl(scopes) {
  return new Promise( (resolve, reject) => {

    // authorize app through console
    var authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes
    });

    if(authUrl) {
      resolve(authUrl);
    } else {
      reject("could not generate authUrl. Please make sure the app exists.");
    }
    
  });
}


export function authorize(key) {
  
  return new Promise( (resolve, reject) => {

    // Check if we have previously stored a token.
    getToken(key)
    .then( token => {
        oauth2Client.credentials = token;
        resolve(oauth2Client);
    })
    .catch( err => {
      reject(err);
    })
  });

};


export function createNewToken(code) {

  return new Promise( (resolve, reject) => {

      // get the token
      oauth2Client.getToken(code, function(err, token) {

        if (err) {
          console.log('Error while trying to retrieve access token', err);
          reject(err);
          return;
        }

        storeToken(token).then( key => {
          resolve(key);
        }).catch( error => {
          reject(error);
        });
        
      });
    });

};



