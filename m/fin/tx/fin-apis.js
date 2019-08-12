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

    getMonthlySpending(cb) {
        fetch(this.createUrl('/spending/current-month'), {
            credentials: 'include'
        })
            .then(function (response) {
                return response.json();
            })
            .then(cb);
    }

    getAvailableMonths(cb) {
        fetch(this.createUrl('/spending/statement-months'), {
            credentials: 'include'
        })
            .then(function (response) {
                return response.json();
            })
            .then(cb);
    }

    getMonthlySpendingForPeriod(month, year, cb) {
        fetch(this.createUrl('/spending/year/' + year + '/month/' + month), {
            credentials: 'include'
        })
            .then(function (response) {
                return response.json();
            })
            .then(cb);
    }
}