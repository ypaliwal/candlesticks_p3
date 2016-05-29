var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/data/db');
// mongoose.connect('mongodb://node:node@novus.modulusmongo.net:27017/Iganiq8o');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function() {
	console.log('Connected to db at /data/db/');
});