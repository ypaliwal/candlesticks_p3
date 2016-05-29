(function() {
	'use strict';
	
	angular
		.module('myApp')
		.service('StockSrv', StockSrv);

		function StockSrv($http) {
			var self = this;

			// Public variables
			self.stockTables = {};


			// Public functions

		}
	
})();