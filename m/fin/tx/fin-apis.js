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

    requestTransactionUpdate(uid, cb) {
        let form = new FormData();
        form.append('uid', uid);
        let headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        let options = {
            method: 'PUT',
            mode: 'cors',
            credentials: 'include',
            headers: headers,
            body: form
        };

        let req = new Request(this.createUrl('/transactions/refresh'), options);
        fetch(req)
            .then(function (response) {
                return response.json();
            })
            .then(cb);
    }
}