class OperationalApis {
    createUrl(path) {
        return 'https://www.indigenously.co.uk/operational/api/v1/'
            .concat(path);
    }

    getAreas(cb) {
        fetch(this.createUrl('ops/areas'), {
            credentials: 'include'
        })
            .then(function (response) {
                return response.json();
            })
            .then(cb);
    }

    getAreaStatus(areaId, cb) {
        fetch(this.createUrl('ops/' + areaId), {
            credentials: 'include'
        })
            .then(function (response) {
                return response.json();
            })
            .then(cb);
    }
}
