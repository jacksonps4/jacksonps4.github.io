define(function() {
    return function ($scope, $routeParams, observationSearchService, locationSearchService, chartService) {
        var locationId = $routeParams.locationId;
        if (!locationId) {
            // error
            return;
        }

        observationSearchService.getLatestObservation(locationId).then(function(latestObservation) {
            $scope.latestObservation = latestObservation;
            chartService.createAngularGauge('Temperature', -20, 40, $scope.latestObservation.temperature, 'C', 'temperature');
            chartService.createAngularGauge('Pressure', 28, 31, $scope.latestObservation.pressureInHg, 'mm Hg', 'pressure');
            chartService.createAngularGauge('Wind speed', 0, 100, $scope.latestObservation.windSpeed, 'kts', 'windSpeed');
            chartService.createAngularGauge('Humidity', 0, 100, $scope.latestObservation.screenRelativeHumidity, 'percent', 'humidity');
     });
    }
});