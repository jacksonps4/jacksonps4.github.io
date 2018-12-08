class ScheduleApis {
    createUrl(path) {
        return 'https://www.indigenously.co.uk/refdata/api/'
            .concat(path);
    }

    doSearchLocations(location, cb) {
        fetch(this.createUrl('location/search?q=' + location), {
            credentials: 'include'
        })
            .then(function (response) {
                return response.json();
            })
            .then(cb);
    }

    doJourneyElementsSearch(departureDate, searchType, serviceDescription, departureStation, cb) {
        fetch(this.createUrl('schedule/journey-elements?date=' + departureDate +
            '&' + searchType + '=' + serviceDescription +
            '&departureStation=' + departureStation), {
            credentials: 'include'
        })
            .then(function (response) {
                return response.json();
            })
            .then(cb);
    }

    doScheduleSearch(departureDate, searchType, serviceDescription, departureStation, cb) {
        fetch(this.createUrl('schedule?date=' + departureDate +
            '&' + searchType + '=' + serviceDescription +
            '&departureStation=' + departureStation), {
            credentials: 'include'
        })
            .then(function (response) {
                return response.json();
            })
            .then(cb);
    }
}
