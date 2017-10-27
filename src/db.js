const NodeCouchDb = require('node-couchdb');
// node-couchdb instance with default options
const couch = new NodeCouchDb();
import { getUser } from './lib/auth';

export default callback => {
	callback();
}

/**
 * Store token to db against a token id we can use
 *
 * @param {Object} token The token to store to disk.
 */
export function insertToken(token) {

  return new Promise( (resolve, reject) => {

		getUser(token).then( (user) => {
			getToken(user.id)
			.then( (tokenObject) => {
				// note that "doc" must have both "_id" and "_rev" fields
				couch.update("conscious-google-tokens", {
				    _id: user.id,
				    _rev: tokenObject.rev,
				    token: tokenObject.token,
						user: user
				}).then( ({data, headers, status}) => {
					resolve(data);
				}, err => {
					reject(err);
				});

			})
			.catch( err => {
				reject(err)
			})

		})

  });
}

export function updateToken(token) {

	couch.update("conscious-google-tokens", {
	    _id: user.id,
	    _rev: tokenObject.rev,
	    token: tokenObject.token,
			user: user
	}).then( ({data, headers, status}) => {
		resolve(data);
	}, err => {
		reject(err);
	});
	
}

export function getToken(key) {

	return new Promise( (resolve, reject) => {

		couch.get("conscious-google-tokens", key)
		.then( ({data, headers, status}) => {
			resolve({
				token: data.token, 
				rev: data._rev
			});
		}, err => {
		   reject(err);
		});

	});
}
