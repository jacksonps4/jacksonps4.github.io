class FinApis {
    createUrl(path) {
        return 'https://api.cwpad.com/finman/api'
            .concat(path);
    }

    doFetch(url, cb, errCb) {
      fetch(this.createUrl(url), {
          credentials: 'include'
        })
        .then(function (response) {
            return response.json();
        })
        .then(cb)
        .catch(errCb);
    }

    getRecentTransactions(cb, page) {
        var url = '/transactions/recent';
        if (page) {
            url = url.concat('?page=' + page);
        }
        this.doFetch(url, cb);
    }

    searchTransactions(q, page, cb) {
        var url = '/transactions/search?q=' + q;
        if (page) {
           url = url.concat('&page=' + page);
        }
        this.doFetch(url, cb);
    }

    getBalance(cb) {
        this.doFetch('/transactions/balance', cb);
    }

    getMonthlySpending(cb) {
        this.doFetch('/spending/current-month', cb);
    }

    getAvailableMonths(cb) {
        this.doFetch('/spending/statement-months', cb);
    }

    getMonthlySpendingForPeriod(month, year, cb) {
        this.doFetch('/spending/year/' + year + '/month/' + month, cb);
    }

    getAnalysis(cb) {
        this.doFetch('/spending/analysis', cb);
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
