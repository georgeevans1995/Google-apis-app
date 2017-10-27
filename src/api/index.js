import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
import { authorize } from '../lib/auth';
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

	api.post('/upload', (req, res) => {

		var { folder } = req.query,
		files = req.files.file;
		authorize().then( (auth) => {

				saveFiles(auth, files, folder).then( (file) => {
					console.log(file);
					res.json(file);
				})
				.catch( (err) => {
					console.log(err);
					res.json({
						"reason": err.error.message,
						"code": err.error.code
					});
				})

		}) 
		.catch( (error) => {
			console.log(error);
			res.json(error);
		});
		
	});

	return api;
}
