var express 	= require('express');
var StockEntry 	= require('./models/stockentry');

var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
	// logging
	next();
});

// // test route to make sure everything is working (accessed at GET http://localhost:8080/)
router.get('/', function(req, res) {
	res.json({ message: 'StockEntry routes GET request.' });
});

// Post a new stockentry
router.post('/newStock',function(req,res){
	var newStock = new StockEntry();

	newStock.ticker = req.body.ticker;
	newStock.purchasePrice = req.body.purchasePrice;
	newStock.quantity = req.body.quantity;


	newStock.save(function(err){
		if(err){
			console.log(err);
			res.status(400)
			   .json({err:err})
		}
		else{
			res.json(newStock);
			// console.log(res);
			console.log(res);
		}
	});
});

// Get all stock entries
router.get('/stocks', function(req, res){
	StockEntry.find(function(err, objectsArray) {
		if (err) {
			console.log(err);
			res.status(400)
				.json({err:err});
		} else {
			res.json(objectsArray);
		}
	});
});


router.delete('/stock/:stock_id', function(req, res) {
	StockEntry.remove({
		_id: req.params.stock_id
	}, function(err, stockEntry) {
		if(err)
			res.send(err);

		res.json({ message: 'Successfully deleted stock entry.' });
	});
});

router.get('/stock/:stock_id', function(req, res) {
	StockEntry.findById(req.params.stock_id, function(err, stock){
		if(err) {
			console.log(err);
		} else {
			res.json(stock);
		}
	})
});

router.put('/stock/:stock_id', function(req, res) {
	var __object = req.body;
	var update = {
		ticker: __object.ticker,
		purchasePrice: __object.purchasePrice,
		quantity: __object.quantity
	}

	var query = {"_id":req.params.stock_id};
	StockEntry.update(query, update, {}, function(err, object){
		if(err) {
			console.log(err);
			res.status(400)
				.json({err: err});
		} else {
			res.json(object);
		}
	});
});


module.exports = router;









