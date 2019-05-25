define(function() {
	return function($http) {
		this.getLast48Hours = function(location) {
			return $http.get('api/obs/last48hours.json?location=' + location)
				.then(function(results) {
					return results.data;
				});
		};
		this.getLatestObservation = function(location) {
			return $http.get('api/obs/latest.json?location=' + location)
				.then(function(results) {
					return results.data;
				})
		};
	}
});