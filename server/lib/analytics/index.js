//******
// * File is used for all interactions with google drive
// * notice all calls to google drive are wrapped in authorize which ensure authentication each time
// * saveFiles() Saves a file to a folder
// * getFolderId() Searches drive for a folder (currently top level only)
// * createFolder() Creates a folder if it doesnt exist (optional)
//******

import Promise from 'bluebird';
import google from 'googleapis';
var fs = require('fs');
import { authorize } from '../auth';

export function getRealtime(key) {

	return new Promise((resolve, reject) => {
		
		authorize(key).then( (auth) => {
			var analytics = google.analytics({ version: 'v3', auth: auth });
			analytics.data.realtime.get({
				ids: 'ga:97868535',
				metrics: 'rt:activeUsers'
			}, function(err, realtime) {
				if (err) {
					reject(err);
				}
				else {
					resolve(realtime);
				}
			});
		});
	});
};



