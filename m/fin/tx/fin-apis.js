class FinApis {
    createUrl(path) {
        return 'https://www.indigenously.co.uk/finman/api'
            .concat(path);
    }

    getRecentTransactions(cb, page) {
        var url = this.createUrl('/transactions/recent');
        if (page) {
            url = url.concat('?page=' + page);
        }
        fetch(url, {
            credentials: 'include'
        })
            .then(function (response) {
                return response.json();
            })
            .then(cb);
    }

    searchTransactions(q, page, cb) {
        var url = this.createUrl('/transactions/search?q=' + q);
        if (page) {
           url = url.concat('&page=' + page);
        }
        fetch(url, {
            credentials: 'include'
        })
            .then(function (response) {
                return response.json();
            })
            .then(cb);
    }

    getBalance(cb) {
        fetch(this.createUrl('/transactions/balance'), {
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

    getAnalysis(cb) {
        fetch(this.createUrl('/spending/analysis'), {
            credentials: 'include'
        })
            .then(function (response) {
                return response.json();
            })
            .then(cb);
    }

    requestTransactionUpdate(uid, cb) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        let options = {
            method: 'PUT',
            mode: 'cors',
            credentials: 'include',
            headers: headers,
            body: 'uid=' + uid
        };

        let req = new Request(this.createUrl('/transactions/refresh'), options);
        fetch(req)
            .then(function (response) {
                return response.json();
            })
            .then(cb);
    }
}