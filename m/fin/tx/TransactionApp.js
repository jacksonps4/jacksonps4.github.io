/*
 * TODO:
 *   - Add expenses category and income/expense charts to transaction feed page
 */
class TransactionsApp {
    constructor() {
        this.apis = new FinApis();
        this.state = {};

        this.pageElements = {
            'cleared': document.getElementById('clearedBalance'),
            'uncleared': document.getElementById('unclearedBalance'),

            'pagination': document.getElementById('transactionPagination'),
            'txPages': document.getElementById('txPages'),

            'recentTransactions': document.getElementById('transactions'),

            'incomeExpenseChartContainer': document.getElementById('monthlyIncomeExpense'),
            'monthlySpendingChartContainer': document.getElementById('monthlySpending'),

            'monthsDropDown': document.getElementById('months'),

            'refreshButton': document.getElementById('refresh'),

            'analysis': document.getElementById('analysis'),

            'searchButton': document.getElementById('searchButton'),
            'searchText': document.getElementById('searchTerm')
        };

        this.loadBalances();
        this.loadTransactions((cb, page) => this.apis.getRecentTransactions(cb, page));
        this.loadMonthlySpendingChart();
        this.loadMonthsDropDown();
        this.bindRefreshButton();
        this.loadSpendingAnalysis();
        this.bindSearchButton();
    }

    clearElement(el) {
        while (el.hasChildNodes()) {
            el.removeChild(el.lastChild);
        }
    }

    bindRefreshButton() {
        this.pageElements.refreshButton.addEventListener('click', e => {
            this.loadTransactions();
            this.loadBalances();
        });
    }

    loadBalances() {
        this.apis.getBalance(balances => {
            this.pageElements.cleared.appendChild(document.createTextNode(balances.clearedBalance));
            this.pageElements.uncleared.appendChild(document.createTextNode(balances.unclearedBalance));
        });
    }

    createNavigation(label, action) {
        let pageElement = document.createElement('li');
        pageElement.className = 'page-item';
        let pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.href = '#';
        pageLink.addEventListener('click', e => {
            action();
        });
        pageLink.appendChild(document.createTextNode(label));
        pageElement.appendChild(pageLink);
        return pageElement;
    }

    createPage(currentPage, page, txProvider, label) {
        let pageElement = document.createElement('li');
        pageElement.className = 'page-item';
        let pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.href = '#';
        pageLink.addEventListener('click', e => {
            this.loadTransactions(txProvider, page);
        });
        if (currentPage === page) {
            pageElement.setAttribute('aria-current', 'page');
            pageElement.className = pageElement.className.concat(' active');
        }
        pageLink.appendChild(document.createTextNode(label ? label : page));
        pageElement.appendChild(pageLink);
        return pageElement;
    }

    loadTransactionPagination(currentPage, pagesAvailable, txProvider) {
        this.pageElements.pagination.hidden = pagesAvailable && pagesAvailable.length == 0;

        this.clearElement(this.pageElements.txPages);

        if (pagesAvailable.length > 5) {
            if (!this.state.range) {
                this.state.range = 0;
            }
            if (this.state.range > 0) {
                this.pageElements.txPages.appendChild(this.createNavigation('Previous', () => {
                    this.state.range--;
                    this.loadTransactionPagination(currentPage, pagesAvailable, txProvider);
                }));
            }
        }
        var max = pagesAvailable.length < (this.state.range * 5) + 5 ? pagesAvailable.length : (this.state.range * 5) + 5;
        for (var i = this.state.range * 5; i < max; i++) {
            this.pageElements.txPages.appendChild(this.createPage(currentPage, i, txProvider));
        }
        if (max < pagesAvailable.length) {
            this.pageElements.txPages.appendChild(this.createNavigation('Next', () => {
                this.state.range++;
                this.loadTransactionPagination(currentPage, pagesAvailable, txProvider);
            }));
        }
    }

    loadTransactions(txProvider, page) {
        txProvider(transactionResponse => {
            this.clearElement(this.pageElements.recentTransactions);

            let currentPage = transactionResponse.page;
            let pages = transactionResponse.pagesAvailable;
            this.loadTransactionPagination(currentPage, pages, txProvider);

            let transactions = transactionResponse.results;
            this.pageElements.recentTransactions.hidden = transactions.length <= 0;

            transactions.forEach((transaction, rowId) => {
                var row = document.createElement("tr");
                var date = document.createElement('td');
                row.id = 'tx-' + rowId;

                var expandGlyph = document.createElement('img');
                expandGlyph.setAttribute('class', 'sync');
                expandGlyph.setAttribute('src', 'arrow.png');
                date.appendChild(expandGlyph);
                expandGlyph.addEventListener('click', e => {
                    let txDetails = document.querySelectorAll('#' + row.id + ' .transactionDetails');
                    for (var j = 0; j < txDetails.length; j++) {
                        let el = txDetails[j];
                        el.hidden = !el.hidden;
                    }
                });

                let cTxDate = transaction.transactionTime.split('T')[0];
                let cTxTime = transaction.transactionTime.split('T')[1];

                date.appendChild(document.createTextNode(cTxDate));
                let cTime = document.createElement('span');
                cTime.className = 'transactionDetails';
                cTime.hidden = true;
                cTime.appendChild(document.createTextNode(cTxTime));
                date.appendChild(cTime);

                var amount = document.createElement('td');
                var amt = transaction.amount.toFixed(2);
                if (amt < 0) {
                    amount.className += 'table-danger';
                }
                if (transaction.currency !== 'GBP') {

                }
                amount.appendChild(document.createTextNode(amt));

                var currency = document.createElement('td');
                currency.appendChild(document.createTextNode(transaction.currency));

                var spendingCategory = document.createElement('td');
                spendingCategory.appendChild(document.createTextNode(transaction.spendingCategory));

                if (transaction.status === 'PENDING') {
                    row.className += "table-secondary";
                }
                if (transaction.status === 'REVERSED') {
                    row.className += "table-info";
                }

                let txCounterparty = transaction.counterparty;
                var txDetails = document.createElement('td');
                txDetails.appendChild(document.createTextNode(txCounterparty));

                let txReference = transaction.reference;
                let txRefElement = document.createElement('span');
                txRefElement.className = 'transactionDetails';
                txRefElement.hidden = true;
                txRefElement.appendChild(document.createTextNode(txReference))
                txDetails.appendChild(txRefElement);

                var refresh = document.createElement('td');
                var refreshGlyph = document.createElement('img');
                refreshGlyph.setAttribute('class', 'sync');
                refreshGlyph.setAttribute('src', 'sync.png');
                refresh.appendChild(refreshGlyph);

                row.appendChild(date);
                row.appendChild(txDetails);
                row.appendChild(amount);
                row.appendChild(currency);
                row.appendChild(spendingCategory);
                row.appendChild(refresh);

                this.pageElements.recentTransactions.appendChild(row);

                refresh.addEventListener('click', e => {
                    this.apis.requestTransactionUpdate(transaction.uid, tx => {
                        this.loadTransactions(txProvider, pages);
                    });
                });
            });
        }, page);
    }

    loadMonthsDropDown() {
        this.pageElements.monthsDropDown.addEventListener('change', e => {
            var selectedPeriod = monthsDropDown.value;
            var selectedItem = selectedPeriod.split('-');
            var selectedMonth = selectedItem[1];
            var selectedYear = selectedItem[0];
            this.loadMonthlyChartForSpecificMonth(selectedMonth, selectedYear);
        });
        this.apis.getAvailableMonths(months => {
            months.forEach(m => {
                var option = document.createElement('option');
                option.value = m;
                option.appendChild(document.createTextNode(m));
                this.pageElements.monthsDropDown.appendChild(option);
            });
        });
    }

    createMonthlySpendingChart(labels, data) {
        this.clearElement(this.pageElements.monthlySpendingChartContainer);
        var monthlySpending = new Chart(this.pageElements.monthlySpendingChartContainer, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Amount',
                    data: data,
                    backgroundColor: [
                        'rgba(255, 0, 0, 0.2)',
                        'rgba(255, 128, 0, 0.2)',
                        'rgba(255, 255, 0, 0.2)',
                        'rgba(128, 255, 0, 0.2)',
                        'rgba(0, 255, 0, 0.2)',
                        'rgba(0, 255, 128, 0.2)',
                        'rgba(0, 255, 255, 0.2)',
                        'rgba(0, 128, 255, 0.2)',
                        'rgba(128, 0, 255, 0.2)',
                        'rgba(127, 0, 255, 0.2)',
                        'rgba(255, 0, 255, 0.2)',
                        'rgba(255, 0, 127, 0.2)',
                        'rgba(128, 128, 128, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 0, 0, 1)',
                        'rgba(255, 128, 0, 1)',
                        'rgba(255, 255, 0, 1)',
                        'rgba(128, 255, 0, 1)',
                        'rgba(0, 255, 0, 1)',
                        'rgba(0, 255, 128, 1)',
                        'rgba(0, 255, 255, 1)',
                        'rgba(0, 128, 255, 1)',
                        'rgba(128, 0, 255, 1)',
                        'rgba(127, 0, 255, 1)',
                        'rgba(255, 0, 255, 1)',
                        'rgba(255, 0, 127, 1)',
                        'rgba(128, 128, 128, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
        return monthlySpending;
    };

    loadMonthlySpendingCategoryChart(monthlySpending) {
        var spendingLabels = [];
        var spendingData = [];
        monthlySpending.spendingCategoryLineItems.forEach(item => {
            if (item.category !== 'INCOME') {
                spendingLabels.push(item.category);
                spendingData.push(item.amount * -1);
            }
        });
        this.createMonthlySpendingChart(spendingLabels, spendingData);
    }

    loadMonthlyIncomeExpensesChart(monthlySpending) {
        var income = 0;
        var expenses = 0;
        monthlySpending.spendingCategoryLineItems.forEach(item => {
            if (item.amount < 0) {
                expenses += (item.amount * -1);
            } else {
                income += item.amount;
            }
        });
        this.createMonthlyIncomeExpenseChart(income, expenses)
    }

    loadMonthlySpendingChart(monthlySpendingChartContainer, incomeExpenseChartContainer) {
        this.apis.getMonthlySpending(monthlySpending => {
            this.loadMonthlySpendingCategoryChart(monthlySpending);
            this.loadMonthlyIncomeExpensesChart(monthlySpending);
        });
    }

    loadMonthlyChartForSpecificMonth(month, year) {
        this.apis.getMonthlySpendingForPeriod(month, year, monthlySpending => {
            this.loadMonthlySpendingCategoryChart(monthlySpending);
            this.loadMonthlyIncomeExpensesChart(monthlySpending);
        });
    }

    createMonthlyIncomeExpenseChart(income, expenses) {
        this.clearElement(this.pageElements.incomeExpenseChartContainer);
        var monthlyIncomeExpense = new Chart(this.pageElements.incomeExpenseChartContainer, {
            type: 'bar',
            data: {
                labels: [ 'Income', 'Expenses' ],
                datasets: [{
                    label: 'Amount',
                    data: [ income, expenses ],
                    backgroundColor: [
                        'rgba(255, 0, 0, 0.2)',
                        'rgba(0, 255, 0, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 0, 0, 1)',
                        'rgba(0, 255, 0, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
        return monthlyIncomeExpense;
    }

    loadSpendingAnalysis() {
        this.apis.getAnalysis(categoryAnalysis => {
            this.clearElement(this.pageElements.analysis);

            if (categoryAnalysis.spendingAnalysisLineItems.length > 0) {
                this.pageElements.analysis.hidden = false;
            } else {
                this.pageElements.analysis.hidden = true;
            }

            categoryAnalysis.spendingAnalysisLineItems.forEach(lineItem => {
                var category = document.createElement('td');
                category.appendChild(document.createTextNode(lineItem.spendingCategory));

                var mean = document.createElement('td');
                var meanAmnt = lineItem.mean.toFixed(2);
                mean.appendChild(document.createTextNode(meanAmnt));

                var row = document.createElement("tr");
                row.appendChild(category);
                row.appendChild(mean);

                this.pageElements.analysis.appendChild(row);
            });
        });
    }

    bindSearchButton() {
        this.pageElements.searchButton.addEventListener('click', e => {
            this.loadTransactions((cb, page) => this.apis.searchTransactions(this.pageElements.searchText.value,
                page, cb));
        });
    }
}