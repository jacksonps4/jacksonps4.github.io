define(function() {
	return function($scope, $routeParams, observationSearchService, locationSearchService, chartService) {
		if ($routeParams.locationId) {
			getObservationsByLocationId($routeParams.locationId);
		}

		function createCharts(observations) {
			chartService.createLineChart(
					"Pressure", observations, $('#pressureChart'),
					function(obs) {
						return obs.time.substring(11);
					},
					function(obs) {
						return obs.pressure;
					});
			chartService.createLineChart(
					["Wind speed", "Wind gust"], observations, $('#windChart'),
					function(obs) {
						return obs.time.substring(11);
					},
					function(obs) {
						return [obs.windSpeed, obs.windGust];
					});
			chartService.createLineChart(
					["Temperature", "Dewpoint"], observations, $('#temperatureChart'),
					function(obs) {
						return obs.time.substring(11);
					},
					function(obs) {
						return [obs.temperature, obs.dewPoint];
					});
			chartService.createLineChart(
					"Humidity", observations, $('#humidityChart'),
					function(obs) {
						return obs.time.substring(11);
					},
					function(obs) {
						return obs.screenRelativeHumidity;
					});						
		};
		
		function showMap(lat, lon) {
			$('#locationMap').attr('src', "https://www.google.com/maps/embed/v1/place?key=AIzaSyBeEpfRATkXSYwcTNtxtc82ZBADzZpXGEQ&q=" 
				+ lat + "," + lon + "&zoom=10");
		}

		function getObservationsByLocationId(locationId) {
			observationSearchService.getLast48Hours(locationId).then(function(observations) {
				$scope.observations = observations;
				createCharts(observations);
			});
		}

		function searchLocation(location) {
			locationSearchService.searchLocation(location).then(function(locations) {
				if (locations.length == 1) {
					getObservationsByLocationId(locations[0].id);
					showMap(locations[0].lat, locations[0].lon);
				} else {
					$scope.locations = locations;
				}
			});
		}

		$scope.searchObservations = function() {
			searchLocation($scope.location);
		}

		$scope.selectLocation = function(locationId) {
			$scope.locations = [];
			observationSearchService.getLast48Hours(locationId).then(function(observations) {
				$scope.observations = observations;
				createCharts(observations);
			});
		};
	}
});