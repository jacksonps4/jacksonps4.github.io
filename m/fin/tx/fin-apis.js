class FinApis {
    createUrl(path) {
        return 'https://www.indigenously.co.uk/finman/api'
            .concat(path);
    }

    getRecentTransactions(cb) {
        fetch(this.createUrl('/transactions/recent'), {
            credentials: 'include'
        })
            .then(function (response) {
                return response.json();
            })
            .then(cb);
    }
}