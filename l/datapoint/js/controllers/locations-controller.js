define(function() {
    return function($scope, $routeParams, locationSearchService) {
        function populateLocations(locations) {
            var map = new google.maps.Map(document.getElementById('locations'), {
                zoom: 6,
                center: new google.maps.LatLng(53, -1),
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });

            var infowindow = new google.maps.InfoWindow();

            var marker, i;

            for (i = 0; i < locations.length; i++) {
                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(locations[i].lat, locations[i].lon),
                    map: map
                });

                google.maps.event.addListener(marker, 'click', (function(marker, i) {
                    return function() {
                        infowindow.setContent(locations[i].name);
                        infowindow.open(map, marker);
                    }
                })(marker, i));
            }
        };

        locationSearchService.listLocations().then(function(locations) {
            populateLocations(locations);
        });
    }
});