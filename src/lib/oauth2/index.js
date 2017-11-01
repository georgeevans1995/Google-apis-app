//******
// * File is used for all interactions with oauth2 api 
// * 
// * saveFiles() Saves a file to a folder
// * getFolderId() Searches drive for a folder (currently top level only)
// * createFolder() Creates a folder if it doesnt exist (optional)
//******

import google from 'googleapis'
import { authorize } from '../auth';

export function getUser(oauth2Client) {
  
  return new Promise((resolve, reject) => {
      
      var oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      
      oauth2.userinfo.get(function(err, response) {
        !err ? resolve(response) : reject(err);
      });

  });
}
