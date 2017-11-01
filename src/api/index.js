import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
import { getInstallUrl, createNewToken, removeAppCredentials } from '../lib/auth';
import { saveFiles } from '../lib/drive';
var formidable = require('express-formidable');

    
export default ({ config, db }) => {
	let api = Router();

	api.use( formidable({
		multiples: true
	}) );
	// mount the facets resource
	api.use('/facets', facets({ config, db }));

	api.get('/', (req, res) => {		
		res.json({ version });
	});


	api.get('/auth', (req, res) => {

		var installServices = req.query.scopes.replace(/[\[\]]+/g, '').split(',');
		var scopes = ['https://www.googleapis.com/auth/userinfo.profile'];

		installServices.forEach( (app) => {
			scopes = scopes.concat(config.scopes[app]);
		});
		
		getInstallUrl(scopes).then( (redirectUrl) => {
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

		var { folder, key } = req.query,
		files = req.files.file;
		
		saveFiles(key, files, folder)
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

	return api;
}
