var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StockSchema = new Schema({
	ticker: String,
	purchasePrice: Number,
	quantity: Number,
	ownerId: String
});

module.exports = mongoose.model('StockEntry', StockSchema)