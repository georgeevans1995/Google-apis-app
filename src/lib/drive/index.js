import Promise from 'bluebird';
import google from 'googleapis';
var fs = require('fs');

export function saveFiles(auth, files, folder) {

	return new Promise((resolve, reject) => {
		
		var drive = google.drive('v3');
		var drive = google.drive({ version: 'v3', auth: auth });
		files = Array.isArray(files) ? files : [files];
		var count = 0;
		var numFiles = files.length;
		

		getFolderId(folder, drive)
		.then( (folder) => {
			
			files.forEach( (file) => {

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
							count++;

							if (count == numFiles) {
								resolve(response)
							}
							
						}
						else {
							reject({
								"error": err
							});
						}
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

export function createFolder(name, drive) {

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
