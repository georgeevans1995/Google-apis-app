# Google services app 
This app adds oauth2 to any services used in the application.

## Install dependencies
npm install

## Start development live-reload server
PORT=8080 npm run dev

## Start production server:
PORT=8080 npm start

## Default setup
By default the app is setup to save files to a users google drive account based on a key (user id). The web application is authenticated through an api enpoint of /api/auth. This will prompt the user to install the app with the set permissions and scopes.

### Google drive service
In /src/config.json the scope of the app is set. Each service that gets configured has its own scopes array. For simply uploading files we just need the `https://www.googleapis.com/auth/drive.file` scope.

API call:
Route: `/api/upload/`
Query params: 
	- `key` type String "API key (user id)" *Required*
	- `folder` type String "Top level folder to save to" *Optional* Defaults to top level
	- `autoCreate` type BOOL "True creates the folder if it does not exist" *Optional* Defaults to true

## Add a new service
	- add the scopes to `/src/config.json`
	- add the route into `/src/api/index.js`
	- wrap any api calls to google apis in authorize and use the returned auth credentials 




```
Docker Support
------
```sh
cd express-es6-rest-api

# Build your docker
docker build -t es6/api-service .
#            ^      ^           ^
#          tag  tag name      Dockerfile location

# run your docker
docker run -p 8080:8080 es6/api-service
#                 ^            ^
#          bind the port    container tag
#          to your host
#          machine port   

```
