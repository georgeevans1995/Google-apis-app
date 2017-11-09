import { version } from '../../package.json';
import { Router } from 'express';
import { saveFiles } from '../lib/drive';
import { getRealtime } from '../lib/analytics';
import { getInstallUrl, createNewToken, removeAppCredentials } from '../lib/auth';
var formidable = require('express-formidable');


    
export default ({ config, db }) => {
	let api = Router();

	// allow files to come through on the upload route
	api.use('/drive/upload', formidable({
		multiples: true
	}));

	api.get('/', (req, res) => {	
		res.json({ version });
	});

	api.get('/auth', (req, res) => {
		
		if(!req.query.scopes) {
			res.json({
				"error": "please define an app scope to install"
			})
		}

		var installServices = req.query.scopes.replace(/[\[\]]+/g, '').split(',');
		var scopes = ['https://www.googleapis.com/auth/userinfo.profile'];

		installServices.forEach( (app) => {
			scopes = scopes.concat(config.scopes[app]);
		});
		
		getInstallUrl(scopes).then( redirectUrl => {
			
			res.writeHead(302, {
			  'Location': redirectUrl
			});
			res.end();
		});

	});

	api.get('/revoke', (req, res) => {
		var {id} = req.query; 
		removeAppCredentials(id).then(response => {
			console.log(response);
			res.json(response);
		}).catch( error => {
			console.log(error);
			res.json(error);
		})
	});

	api.get('/success', (req, res) => {

		if(req.query.code) {

			createNewToken(req.query.code)
			.then( (key) => {
				res.json({"key": key});
			})
			.catch( (error) => {
				res.json(error);
			});

		}
	});

	api.post('/upload', (req, res) => {

		var { folder, key, autoCreate } = req.query,
		files = req.files.file;
		
		saveFiles(key, files, folder, autoCreate)
		.then( (file) => {
			res.status( 200 ).json( file );
		})
		.catch( (err) => {

			res.json({
				"reason": err.error.message,
				"code": err.error.code
			});
		});
		
	});

	api.get('/analytics', (req, res) => {
		var { key } = req.query;
		
		getRealtime(key)
		.then( (response) => {
			res.status( 200 ).json( response );
		})
		.catch( (err) => {
			res.json(err);
		});
		
	});

	return api;
}
