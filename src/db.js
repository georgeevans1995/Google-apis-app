//******
// * File is used for any interaction with the db
// * storeToken() checks if user exists and stores/updates the token for the user
// * insertToken() Simple insert of token to db
// * appInstalled() App already installed. Uninstall and install again if needed
// * removeApp() Deletes app details from the database
//******

const NodeCouchDb = require('node-couchdb');
// node-couchdb instance with default options
const couch = new NodeCouchDb();
import { getUser } from './lib/oauth2';

export default callback => {
	callback();
}

export function storeToken(token) {

	return new Promise( (resolve, reject) => {

		getUser(token)
		.then( (user) => {
			
			getToken(user.id)
			.then( (tokenObject) => {
				
				if(!tokenObject) {
					return insertToken(token, user);
				} else {
					return appInstalled(user.id);
				}
			})
			.then(token => {
				resolve(token);
			})
		})
		.catch( err => {
			reject(err);
		});
	});
}


export function updateToken(id, token) {

	return new Promise( (resolve, reject) => {
		getToken(id)
		.then( (tokenObject) => {
			
			// note that "doc" must have both "_id" and "_rev" fields
			couch.insert("conscious-google-tokens", {
			    _id: id,
			    _rev: tokenObject._rev,
			    token: token,
			    user: tokenObject.user
			}).then( ({data, headers, status}) => {
				resolve(data);
			}, err => {
				reject(err);
			})

		})
	});
}

/**
 * Store token to db against a token id we can use
 *
 * @param {Object} token The token to store to disk.
 */
export function insertToken(token, user) {

  return new Promise( (resolve, reject) => {

			// note that "doc" must have both "_id" and "_rev" fields
			couch.insert("conscious-google-tokens", {
			    _id: user.id,
			    token: token,
					user: user
			}).then( ({data, headers, status}) => {
				resolve(data);
			}, err => {
				reject(err);
			})
	});
}

export function appInstalled(id) {
	return new Promise( (resolve, reject) => {
		resolve({
			"error": "application already installed. Please uninstall the app and try again",
			"id": id,
			"uninstallURL": "/api/revoke/?id=" + id
		});
	});
}

export function removeApp(id) {
	return new Promise((resolve, reject) => {
		
		getToken(id).then( (tokenInfo) => {

			couch.del("conscious-google-tokens", id, tokenInfo._rev).then(({data, headers, status}) => {
			    resolve({
			    	"message": "successfully revoked application"
			    });
			}, err => {
			   reject(err);
			});
		}, err => {
			reject(err);
		});
	});
}

export function getToken(userID) {

	return new Promise( (resolve, reject) => {

		couch.get("conscious-google-tokens", userID)
		.then( ({data, headers, status}) => {
			resolve(data);
		}, err => {
		   resolve(false);
		});

	});
}
