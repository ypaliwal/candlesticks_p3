(function(){
	'use strict';

	angular
		.module('myApp', ['ui.router']);

	angular
		.module('myApp')
		.config(function($stateProvider, $httpProvider, $urlRouterProvider){
			$urlRouterProvider.otherwise('/');

			$stateProvider
			.state('home', {
				url: '/',
				templateUrl: 'site/partials/home.html',
				controller: 'HomeCtrl as ctrl'
			});
		});

})();