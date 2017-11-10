//******
// * File establishes creates an Oauth client 
// * getInstallUrl() generate a redirect url to install app on user account
// * authorize() sets our credentials to be that user
// * createNewToken() generates a new access token when given a access code
// * removeAppCredentials() revokes access to the app for the user based on id
//******

var fs = require('fs');
import googleAuth from 'google-auth-library';
import users from '../cloudant/usersdb.js';
import credentials from './client_secret.json';
import Promise from 'bluebird'; 

import { getProfileInfo } from '../oauth2';

var getUser = Promise.promisify(users.get.bind(users));
var removeUser = Promise.promisify(users.remove.bind(users));
var storeUser = Promise.promisify(users.put.bind(users));

var clientSecret = credentials.web.client_secret,
    clientId = credentials.web.client_id,
    redirectUrl = credentials.web.redirect_uris[0],
    auth = new googleAuth(),
    oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);


export function getInstallUrl(scopes) {
  
  return new Promise( (resolve, reject) => {

    // authorize app through a url redirect
    var authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes
    });

    if(authUrl) {
      resolve(authUrl);
    } else {
      reject({"error": "could not generate authUrl. Please make sure the app exists."});
    }
    
  });
}


export function authorize(key) {
  
  return new Promise( (resolve, reject) => {

    // Get previously stored token
    getUser(key)
    .then( userInfo => {

        oauth2Client.credentials = userInfo.credentials;
        var currentToken = userInfo.credentials.access_token;
        
        // set the access token for the oauth2 client
        oauth2Client.getAccessToken( (err, access_token, response) => {
          
          // if its changed store it to the db
          if(access_token != currentToken) {
            userInfo.credentials.access_token = access_token;
            storeUser(userInfo)
            .then( () => {
              resolve(oauth2Client);
            })
          } else {
            resolve(oauth2Client);
          }
          
        })
       
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
          console.log('Error while trying to create an access token', err);
          reject(err);
          return;
        }
        oauth2Client.credentials = token;

        getProfileInfo(oauth2Client)
        .then( (user) => {
          
          var userInfo = {
            _id: user.id,
            user: user, 
            credentials: oauth2Client.credentials
          }
          return storeUser(userInfo)
        })
        .then( (user) => {
          resolve(user);
        })
        .catch( error => {
          reject(error);
        })
      
      });
    });

};

export function removeAppCredentials(key) {
  return new Promise( (resolve, reject) => {
    
    // Check if we have previously stored a token.
    getUser(key)
    .then( userInfo => {
      console.log(userInfo);
        oauth2Client.credentials = userInfo.credentials;

        oauth2Client.revokeCredentials( function(err) {
          if(err) {
            reject(err);
          }
        });
        return removeUser(userInfo)
    })
    .then( (message) => {
          resolve({
            "message": message
          })
    })
    .catch( err => {
      reject(err);
    });

  });
}

