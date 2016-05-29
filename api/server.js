// BASE SETUP
// call the packages we need: 
var express 	= require('express');			// call express
var app			= express(); 						// define our app using express
var bodyParser 	= require('body-parser');
var db 			= require('./config/db');

app.use(express.static(__dirname + './../app/'));

// config app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;	// set our port

// _________________________________
// REGISTER OUR ROUTES
// all of our routes will be prefixed with /api
var stockroutes = require('./stockEntryRoutes');
app.use('/', stockroutes);


// _________________________________
// START THE SERVER
app.listen(port);
console.log('Magic happens on port ' + port);




