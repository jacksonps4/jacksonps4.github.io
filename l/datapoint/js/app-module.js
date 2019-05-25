 define([
    'jquery',
    'angular',
    'common/chart',
    'services/observation-search-service',
    'services/location-search-service',
    'services/chart-service',
    'controllers/search-controller',
    'controllers/locations-controller',
    'controllers/current-controller',
    'controllers/static-controller'
 ], 
    function(
    	jQuery,
        angular,
        Chart,
        ObservationSearchService,
        LocationSearchService,
        ChartService,
        SearchController,
        LocationsController,
        CurrentController,
        StaticController
    ) {
        var module = angular.module('datapoint', [])
            .config(['$routeProvider',
                function ($routeProvider) {
                  $routeProvider.
                    when('/search', { templateUrl: 'static/Search.html', controller: SearchController }).
                    when('/locations', { templateUrl: 'static/Locations.html', controller: LocationsController }).
                    when('/current', { templateUrl: 'static/Current.html', controller: CurrentController }).
                    otherwise({templateUrl: 'static/Home.html', controller: StaticController});
            }
        ]);
        module.factory('chartService', function() {
        	return new ChartService(Chart);
        });
        module.factory('observationSearchService', function($http) {
    		return new ObservationSearchService($http);
        });
        module.factory('locationSearchService', function($http) {
        	return new LocationSearchService($http);
        });
        return module;
 });