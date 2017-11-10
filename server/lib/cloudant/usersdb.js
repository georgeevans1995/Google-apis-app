/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import dotenv from 'dotenv'
dotenv.config()

var extend = require('extend');

console.log(process.env.CLOUDANT_PASSWORD);

var me = process.env.CLOUDANT_URL;         // Substitute with your Cloudant user account.
var otherUsername = process.env.CLOUDANT_USER; // Substitute with some other Cloudant user account.
var otherPassword = process.env.CLOUDANT_PASSWORD;
var cloudant = require('cloudant')({account:me, username:otherUsername, password:otherPassword});

var dbname = 'users';
var usersdb = null;

try{
  usersdb = cloudant.db.create(dbname);

  if (usersdb != null){
    usersdb = cloudant.db.use(dbname);
  }
}catch(e){
  usersdb = cloudant.db.use(dbname);
}



module.exports = {
  /**
   * Returns an element by id or undefined if it doesn't exists
   * @param  {[type]}   params._id The user id
   * @param  {Function} callback The callback
   * @return {void}
   */
  get: function(id, callback) {
    
    usersdb.get(id, function(err, response) {
      if (err) {
        if (err.error !== 'not_found') {
          return callback(err);
        } else {
          return callback(null);
        }
      } else {
        return callback(null, response);
      }
    });
  },
  /**
   * Inserts an element in the database
   * @param  {[type]}   params._id The user id
   * @param  {Function} callback The callback
   * @return {void}
   */
  put: function(doc, callback) {
    
    usersdb.insert(doc, function (err, response) {
      if (err) {
        return callback(err);
      } else {
        return callback(null, response);
      }
    });
  },

  remove: function(doc, callback) {
    
    usersdb.destroy(doc._id, doc._rev, function(err, data) {
      console.log('Error:', err);
      console.log('Data:', data);
      callback(err, data);
    });
  }
};
