(function() {
	'use strict';

	angular
		.module('myApp')
		.controller('HomeCtrl', HomeCtrl);

	function HomeCtrl($state, $http, StockSrv, $location, $anchorScroll) {
		var homeVm = this;

		// Public functions
		homeVm.deleteStock = deleteStock;
		homeVm.addStock = addStock;
		homeVm.exData = exData;
		homeVm.updateStock = updateStock;
		homeVm.updateStockAct = updateStockAct;
		homeVm.populateQuandl = populateQuandl;
		homeVm.makeChart = makeChart;
		homeVm.scrollTo = scrollTo;
		// homeVm.printSrvObj = printSrvObj;
		
		homeVm.protfolioTotal = 0;
		homeVm.totalBookValue = 0;
		homeVm.chartTitle = "";
		homeVm.chartLoaded = false;

		homeVm.chartLoadArr = [];
		
		


		// GET METHOD to get ALL stock entries
		$http.get('stocks')
		.then(function(res){
			populate(res.data);
		}, function(err){console.log(err)});
		function populate(arr) {
			homeVm.dataArr = arr;
			console.log(homeVm.dataArr);
			setTimeout(function(){ 
				// console.log(homeVm.dataArr);
				populateQuandl(homeVm.dataArr);
			}, 150);
		}

		// POPULATE RELEVANT STOCK DATA FROM QUANDL
		function populateQuandl(arr) {
			var arrLen = arr.length - 1;
			populateQuandlHelper(arrLen, arr);
		}
		function populateQuandlHelper(count, arr) {
			if(count >= 0) {
				var tickerUrl = arr[count].ticker;
				$http({
					method: 'GET',
					url: 'https://www.quandl.com/api/v3/datasets/WIKI/' + tickerUrl + '.json?api_key=rh1C19BLzxoz3PZs7HB6',
				}).then(function(res) {
					if (res.data.dataset.name.split('(')[0] != undefined) {
						var thisArr = count;

						arr[thisArr].name = res.data.dataset.name.split('(')[0]; // Company name
						arr[thisArr].currPrice = res.data.dataset.data[0][4]; // Price for today
						console.log(res.data.dataset.data[0]);
						arr[thisArr].marketPrice = arr[thisArr].currPrice * arr[thisArr].quantity;
						arr[thisArr].percentageChange = (((arr[thisArr].currPrice - arr[thisArr].purchasePrice)/arr[thisArr].purchasePrice)*100);
						arr[thisArr].bookValue = arr[thisArr].purchasePrice * arr[thisArr].quantity;
						homeVm.protfolioTotal += arr[thisArr].marketPrice;
						homeVm.totalBookValue += arr[thisArr].bookValue;
						StockSrv.stockTables[tickerUrl + '_compName'] = arr[thisArr].name;

						if(!(tickerUrl in StockSrv.stockTables)) {
							var closeValues = [];
							var closeDates = [];

							for(var i = 0; i < 22; i++) {
								closeValues.push(res.data.dataset.data[i][4]);
								closeDates.push(res.data.dataset.data[i][0]);
							}

							// for(var i = 0; i < ){}
							// StockSrv.tickerUrl
							StockSrv[tickerUrl + '_dates'] = closeDates;
							StockSrv[tickerUrl + '_values'] = closeValues;
						}
					}
					if(!homeVm.chartLoaded) {
						makeChart(tickerUrl);
					}
				}, function(err) { console.log(err) });
				populateQuandlHelper(count - 1, arr);	
			} else {
				return 0;
			}
		}

		// STOCK DELETE VIA BUTTON
		function deleteStock(id) {
			$http.delete("stock/" + id)
			.then(function(res) {
				console.log(res);
				setTimeout(function() {
					$state.reload();
				}, 100);
			}, function(err){console.log(err)});
		}

		function updateStock(id) {
			$http.get("stock/" + id)
			.then(function(res){
				homeVm.updateStockData = res.data;
				openModalwData(homeVm.updateStockData);
			}, function(err) {console.log(err)});
		}
		function openModalwData(data) {
			console.log(data);

			// open the modal
			// MODAL; Click events
			var modal = document.getElementById('myModal');
			var btn = document.getElementById("myBtn");
			var span = document.getElementsByClassName("close")[0];
			modal.style.display = "block";
			span.onclick = function() {
			    modal.style.display = "none";
			}
			window.onclick = function(event) {
			    if (event.target == modal) {
			        modal.style.display = "none";
			    }
			}

			// attach the ng-models to the input forms and the data rec'd
			homeVm.modalId = data._id;
			homeVm.modalTicker = data.ticker;
			homeVm.modalPurchasePrice = data.purchasePrice;
			homeVm.modalQuantity = data.quantity;
		}
		function updateStockAct() {
			homeVm.putData = {
				ticker: homeVm.modalTicker,
				purchasePrice: homeVm.modalPurchasePrice,
				quantity: homeVm.modalQuantity
			};
			$http.put('stock/' + homeVm.modalId, homeVm.putData)
			.then(function (res) {
				console.log(res);
				$state.reload();
			}, function (err) {
				console.log(err);
			});
		}

		function makeChart(tickerInput) {
			if(homeVm.chartLoaded) {
				scrollTo('graph');
			}

			homeVm.chartLoaded = true;

			if((tickerInput != homeVm.chartLoadArr[0]) && (tickerInput != homeVm.chartLoadArr[1])) {

				homeVm.config.data.labels = StockSrv[tickerInput + '_dates'];				
				homeVm.chartLoadArr.unshift(tickerInput);

				$("#canvas").remove();
				$("#canvas-wrapper").append('<canvas id="canvas"></canvas>');
				
				for(var i = 0; i < 2; i++){
					if (homeVm.chartLoadArr[i] != undefined){
						var ticker = homeVm.chartLoadArr[i];

						homeVm.config.data.datasets[i].data = StockSrv[ticker + '_values'];
						homeVm.config.data.datasets[i].label = ticker;

						homeVm.config.data.datasets[i].backgroundColor = randomColor(0.6);
						homeVm.config.data.datasets[i].pointBorderColor = randomColor();
					}
				}
				// create the chart
				var ctx = document.getElementById("canvas").getContext("2d");
				window.myLine = new Chart(ctx, homeVm.config);

				homeVm.chartTitle = ("Stock Chart for " + StockSrv.stockTables[homeVm.chartLoadArr[0] + '_compName']);
				if(homeVm.chartLoadArr[1] != undefined) {
					homeVm.chartTitle += (' and ' + StockSrv.stockTables[homeVm.chartLoadArr[1] + '_compName']);
				}

			}
		}

		// ADD A STOCK VIA BUTTON
		function addStock() {
			var req = {
				method: 'POST',
				url: "newStock",
				data: { ticker: homeVm.addTicker, purchasePrice: homeVm.addPurchasePrice, quantity: homeVm.addQuantity }
			}
			$http(req)
			.then(
				function(res){
					// console.log(res);
					console.log(res.data._id);

					setTimeout(function() {
						$state.reload();
					}, 100);
				},
				function(err){console.log(err)}
			);
			
		}

		// ADD EXAMPLE STOCKS VIA BUTTON
		function exData() {
			var dataBits = [];

			dataBits
				.push({ ticker: 'GOOG', purchasePrice: '445.11', quantity: '200' });
			dataBits
				.push({ ticker: 'AAPL', purchasePrice: '125.25', quantity: '350' });
			dataBits
				.push({ ticker: 'TSLA', purchasePrice: '225.84', quantity: '600' });
			dataBits
				.push({ ticker: 'BRK.A', purchasePrice: '78945.18', quantity: '5' });
			dataBits
				.push({ ticker: 'NLY', purchasePrice: '11.28', quantity: '250' });

			for(var i = 0; i < dataBits.length; i++) {
				var req = { method: 'POST', url: "newStock", data: dataBits[i] };
				$http(req)
				.then(
					function(res){console.log(res)},
					function(err){console.log(err)});

				setTimeout(function(){ 
					$state.reload();
					 }, 50);
			}
		}

		function scrollTo(scrollLocation) {
			$location.hash(scrollLocation);
			$anchorScroll();

		}

		// CONFIG DATA FOR CHART
		homeVm.config = {
			type: 'line',
			data: {
				labels: [], // EXAMPLE: labels: ["January", "February", "March", "April", "May", "June", "July", "August"],
				datasets: [{
					label: "My First dataset", // EXAMPLE: label: "My First dataset",
					data: [] // EXAMPLE: data: [10, 12, 33, 41, 55, 40, 22, 21],
				},{
					label: "Select another Stock", // EXAMPLE: label: "My First dataset",
					data: [] // EXAMPLE: data: [10, 12, 33, 41, 55, 40, 22, 21],
				}]
			},
			options: {

				responsive: true,
	            
				tooltips: {
					mode: 'label',
				},
				hover: {
					mode: 'label'
				},
				scales: {
					xAxes: [{
						scaleLabel: {
							display: true,
							labelString: 'Date'
						}
					}],
					yAxes: [{
						// stacked: true,
						scaleLabel: {
							display: true,
							labelString: 'Price (USD)'
						}, 
						// scaleStartValue: 10
						// ticks: {
						// 	suggestedMin: 10,
						// }
					}]
				}
			}
		};

		function randomColorFactor() {
			return Math.round(Math.random() * 255);
		};
		function randomColor(opacity) {
			return 'rgba(' + randomColorFactor() + ',' + randomColorFactor() + ',' + randomColorFactor() + ',' + (opacity || '1') + ')';
		}
	}
})();


// ___________________________________________
//
// REFACTORED CODE, SAVED/ARCHIVED (FROM )
//
// for(var i = 0; i < 1; i++) {
// 	var theUrl = arr[i].ticker;
// 	$http({
// 		method: 'GET',
// 		url: 'https://www.quandl.com/api/v3/datasets/WIKI/' + theUrl + '.json?api_key=rh1C19BLzxoz3PZs7HB6'
// 	}).then(function(res) {
// 		if (res.data.dataset.name.split('(')[0] != undefined) {
// 			console.log(res.data.dataset.name.split('(')[0]);
// 			arr[i].name = res.data.dataset.name.split('(')[0];	
// 		}		
// 	}, function(err) { console.log(err) });
// }
// console.log(arr);
// var tickerUrl = arr[0].ticker;
// $http({
// 	method: 'GET',
// 	url: 'https://www.quandl.com/api/v3/datasets/WIKI/' + tickerUrl + '.json?api_key=rh1C19BLzxoz3PZs7HB6',
// }).then(function(res) {
// 	if (res.data.dataset.name.split('(')[0] != undefined) {
// 		var thisArr = 0;
// 		console.log(res.data.dataset.name.split('(')[0]);
// 		arr[thisArr].name = res.data.dataset.name.split('(')[0];	
// 		arr[thisArr].name = res.data.dataset.name.split('(')[0];	
// 		arr[thisArr].currPrice = res.data.dataset.data[0][4];
// 		arr[thisArr].marketPrice = arr[thisArr].currPrice * arr[thisArr].quantity;
// 		arr[thisArr].percentageChange = (((arr[thisArr].currPrice - arr[thisArr].purchasePrice)/arr[thisArr].purchasePrice)*100);
// 		arr[thisArr].bookValue = arr[thisArr].purchasePrice * arr[thisArr].quantity;
// 		homeVm.protfolioTotal += arr[thisArr].marketPrice;
// 		homeVm.totalBookValue += arr[thisArr].bookValue;
// 	}
// }, function(err) { console.log(err) });
// var tickerUrl1 = arr[1].ticker;
// $http({
// 	method: 'GET',
// 	url: 'https://www.quandl.com/api/v3/datasets/WIKI/' + tickerUrl1 + '.json?api_key=rh1C19BLzxoz3PZs7HB6',
// }).then(function(res) {
// 	if (res.data.dataset.name.split('(')[0] != undefined) {
// 		var thisArr = 1;
// 		console.log(res.data.dataset.name.split('(')[0]);
// 		arr[thisArr].name = res.data.dataset.name.split('(')[0];	
// 		arr[thisArr].name = res.data.dataset.name.split('(')[0];	
// 		arr[thisArr].currPrice = res.data.dataset.data[0][4];
// 		arr[thisArr].marketPrice = arr[thisArr].currPrice * arr[thisArr].quantity;
// 		arr[thisArr].percentageChange = (((arr[thisArr].currPrice - arr[thisArr].purchasePrice)/arr[thisArr].purchasePrice)*100);
// 		arr[thisArr].bookValue = arr[thisArr].purchasePrice * arr[thisArr].quantity;
// 		homeVm.protfolioTotal += arr[thisArr].marketPrice;
// 		homeVm.totalBookValue += arr[thisArr].bookValue;
// 	}
// }, function(err) { console.log(err) });	
// var tickerUrl2 = arr[2].ticker;
// $http({
// 	method: 'GET',
// 	url: 'https://www.quandl.com/api/v3/datasets/WIKI/' + tickerUrl2 + '.json?api_key=rh1C19BLzxoz3PZs7HB6',
// }).then(function(res) {
// 	if (res.data.dataset.name.split('(')[0] != undefined) {
// 		var thisArr = 2;
// 		console.log(res.data.dataset.name.split('(')[0]);
// 		arr[thisArr].name = res.data.dataset.name.split('(')[0];	
// 		arr[thisArr].name = res.data.dataset.name.split('(')[0];	
// 		arr[thisArr].currPrice = res.data.dataset.data[0][4];
// 		arr[thisArr].marketPrice = arr[thisArr].currPrice * arr[thisArr].quantity;
// 		arr[thisArr].percentageChange = (((arr[thisArr].currPrice - arr[thisArr].purchasePrice)/arr[thisArr].purchasePrice)*100);
// 		arr[thisArr].bookValue = arr[thisArr].purchasePrice * arr[thisArr].quantity;
// 		homeVm.protfolioTotal += arr[thisArr].marketPrice;
// 		homeVm.totalBookValue += arr[thisArr].bookValue;
// 	}
// }, function(err) { console.log(err) });	
// var tickerUrl3 = arr[3].ticker;
// $http({
// 	method: 'GET',
// 	url: 'https://www.quandl.com/api/v3/datasets/WIKI/' + tickerUrl3 + '.json?api_key=rh1C19BLzxoz3PZs7HB6',
// }).then(function(res) {
// 	if (res.data.dataset.name.split('(')[0] != undefined) {
// 		var thisArr = 3;
// 		console.log(res.data.dataset.name.split('(')[0]);
// 		arr[thisArr].name = res.data.dataset.name.split('(')[0];	
// 		arr[thisArr].name = res.data.dataset.name.split('(')[0];	
// 		arr[thisArr].currPrice = res.data.dataset.data[0][4];
// 		arr[thisArr].marketPrice = arr[thisArr].currPrice * arr[thisArr].quantity;
// 		arr[thisArr].percentageChange = (((arr[thisArr].currPrice - arr[thisArr].purchasePrice)/arr[thisArr].purchasePrice)*100);
// 		arr[thisArr].bookValue = arr[thisArr].purchasePrice * arr[thisArr].quantity;
// 		homeVm.protfolioTotal += arr[thisArr].marketPrice;
// 		homeVm.totalBookValue += arr[thisArr].bookValue;
// 	}
// }, function(err) { console.log(err) });	
// var tickerUrl4 = arr[4].ticker;
// $http({
// 	method: 'GET',
// 	url: 'https://www.quandl.com/api/v3/datasets/WIKI/' + tickerUrl4 + '.json?api_key=rh1C19BLzxoz3PZs7HB6',
// }).then(function(res) {
// 	if (res.data.dataset.name.split('(')[0] != undefined) {
// 		var thisArr = 4;
// 		console.log(res.data.dataset.name.split('(')[0]);
// 		arr[thisArr].name = res.data.dataset.name.split('(')[0];	
// 		arr[thisArr].name = res.data.dataset.name.split('(')[0];	
// 		arr[thisArr].currPrice = res.data.dataset.data[0][4];
// 		arr[thisArr].marketPrice = arr[thisArr].currPrice * arr[thisArr].quantity;
// 		arr[thisArr].percentageChange = (((arr[thisArr].currPrice - arr[thisArr].purchasePrice)/arr[thisArr].purchasePrice)*100);
// 		arr[thisArr].bookValue = arr[thisArr].purchasePrice * arr[thisArr].quantity;
// 		homeVm.protfolioTotal += arr[thisArr].marketPrice;
// 		homeVm.totalBookValue += arr[thisArr].bookValue;
// 	}
// }, function(err) { console.log(err) });	
// var tickerUrl4 = arr[4].ticker;
// $http({
// 	method: 'GET',
// 	url: 'https://www.quandl.com/api/v3/datasets/WIKI/' + tickerUrl4 + '.json?api_key=rh1C19BLzxoz3PZs7HB6',
// }).then(function(res) {
// 	if (res.data.dataset.name.split('(')[0] != undefined) {
// 		var thisArr = 4;
// 		console.log(res.data.dataset.name.split('(')[0]);
// 		arr[thisArr].name = res.data.dataset.name.split('(')[0];	
// 		arr[thisArr].name = res.data.dataset.name.split('(')[0];	
// 		arr[thisArr].currPrice = res.data.dataset.data[0][4];
// 		arr[thisArr].marketPrice = arr[thisArr].currPrice * arr[thisArr].quantity;
// 		arr[thisArr].percentageChange = (((arr[thisArr].currPrice - arr[thisArr].purchasePrice)/arr[thisArr].purchasePrice)*100);
// 		arr[thisArr].bookValue = arr[thisArr].purchasePrice * arr[thisArr].quantity;
// 		homeVm.protfolioTotal += arr[thisArr].marketPrice;
// 		homeVm.totalBookValue += arr[thisArr].bookValue;
// 	}
// }, function(err) { console.log(err) });