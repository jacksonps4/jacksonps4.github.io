define(function() {
	return function($http) {
		this.searchLocation = function(locationText) {
			return $http.get('api/loc/search?name=' + locationText)
				.then(function(results) {
					return results.data;
				});
		};

		this.listLocations = function() {
			return $http.get('api/loc')
				.then(function(results) {
					return results.data;
				});
		};
	}
});