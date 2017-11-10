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

export function saveFiles(key, files, folder) {

	return new Promise((resolve, reject) => {
		
		authorize(key).then( (auth) => {
			
			var drive = google.drive({ version: 'v3', auth: auth });
			files = Array.isArray(files) ? files : [files];

			// get the parent folrder by name
			getFolderId(folder, drive)
			.then( (folder) => {
				
				// loop through each file thats being saved
				files.forEach( (file) => {

					// save to drive
					drive.files.create({
						fields: 'id',
					  resource: {
					    name: file.name,
					    mimeType: file.type,
					    parents: [folder.id]
					  },
					  media: {
					    mimeType: 'image/png',
					    body: fs.createReadStream(file.path)
					  }
					}, function(err, response) {
							if (!err) {

								getFileInfo(response.id, drive)
								.then(fileInfo => {
									resolve(fileInfo);
								})
								.catch(err => {
									reject(err);
								});
								
							}
							else {
								reject({
									"error": err
								});
							}
						});
					});
				});

			})
			.catch( (error) => {

				reject({
					"error": error
				})
		});
	});
};


// 
export function getFolderId(name, drive, autoCreate = true) {

	return new Promise((resolve, reject) => {
		// autoCreate = autoCreate === false ? false : true;
	  drive.files.list({
	  	q: "mimeType='application/vnd.google-apps.folder' and name = '" + name + "'"
	  }, function (err, resp) {
	    
	    if (err) {
	    	reject(err);
	    }
	    else if(resp.files[0]) {
	    	resolve(resp.files[0])
	    } else {

	    	if (autoCreate) {
		    	createFolder(name, drive)
		    	.then( (id) => {
		    		resolve(id);
		    	})
		    	.catch( (err) => {
		    		reject(err);
		    	})
	    	} else {
	    		reject(new Error("Folder does not exist"));
	    	}

	    }
	  });

	});

}

export function createFolder (name, drive) {

	return new Promise((resolve, reject) => {

		drive.files.create({
		  resource: {
		    name: name,
		    mimeType: 'application/vnd.google-apps.folder'
		  }
		}, function(err, response) {
				if (!err) {
					resolve(response)
				}
				else {
					reject({
						"error": err
					});
				}
			});

	});

}

export function getFileInfo (fileId, drive) {
	
	return new Promise( (resolve, reject) => {
		
		drive.files.get({
			fileId: fileId,
			fields: ['webViewLink', 'id', 'name', 'mimeType']
		}, function(err, response) {
			if (!err) {
				resolve(response)
			}
			else {
				reject({
					"error": err
				});
			}
		});
	});
}
