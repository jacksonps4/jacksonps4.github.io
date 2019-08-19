/*
 * TODO:
 *   - Add search to transaction feed page which updates charts
 *     o Add transaction search endpoint with pagination
 *     o Add pagination UI elements and bind
 *   - Add expenses category and income/expense charts to transaction feed page
 *   - Refactor as this is a bit messy. Too many references being passed around. Smells.
 */
class TransactionsApp {
    constructor() {
        this.apis = new FinApis();
        this.state = {};

        let cleared = document.getElementById('clearedBalance')
        let uncleared = document.getElementById('unclearedBalance');
        this.loadBalances(cleared, uncleared);

        let pagination = document.getElementById('transactionPagination');
        let txPages = document.getElementById('txPages');

        let recentTransactions = document.getElementById('transactions')
        this.loadTransactions(pagination, txPages, recentTransactions);

        let incomeExpenseChartContainer = document.getElementById('monthlyIncomeExpense');
        var monthlySpendingChartContainer = document.getElementById('monthlySpending');
        this.loadMonthlySpendingChart(monthlySpendingChartContainer, incomeExpenseChartContainer);

        let monthsDropDown = document.getElementById('months');
        this.loadMonthsDropDown(monthlySpendingChartContainer, incomeExpenseChartContainer, monthsDropDown);

        let refreshButton = document.getElementById('refresh');
        this.bindRefreshButton(refreshButton,
            () => this.loadTransactions(pagination, txPages, recentTransactions),
            () => this.loadBalances(cleared, uncleared));

        let analysis = document.getElementById('analysis')
        this.loadSpendingAnalysis(analysis);
    }

    clearElement(el) {
        while (el.hasChildNodes()) {
            el.removeChild(el.lastChild);
        }
    }

    bindRefreshButton(refreshButton, loadTransactions, loadBalances) {
        refreshButton.addEventListener('click', e => {
            loadTransactions();
            loadBalances();
        });
    }

    loadBalances(cleared, uncleared) {
        this.apis.getBalance(balances => {
            cleared.appendChild(document.createTextNode(balances.clearedBalance));
            uncleared.appendChild(document.createTextNode(balances.unclearedBalance));
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

    createPage(currentPage, page, pagination, recentTransactions, pages, label) {
        let pageElement = document.createElement('li');
        pageElement.className = 'page-item';
        let pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.href = '#';
        pageLink.addEventListener('click', e => {
            this.loadTransactions(pagination, pages, recentTransactions, page);
        });
        if (currentPage === page) {
            pageElement.setAttribute('aria-current', 'page');
            pageElement.className = pageElement.className.concat(' active');
        }
        pageLink.appendChild(document.createTextNode(label ? label : page));
        pageElement.appendChild(pageLink);
        return pageElement;
    }

    loadTransactionPagination(pagination, pages, currentPage, pagesAvailable, recentTransactions) {
        pagination.hidden = pagesAvailable && pagesAvailable.length == 0;

        this.clearElement(pages);

        if (pagesAvailable.length > 5) {
            if (!this.state.range) {
                this.state.range = 0;
            }
            if (this.state.range > 0) {
                pages.appendChild(this.createNavigation('Previous', () => {
                    this.state.range--;
                    this.loadTransactionPagination(pagination, pages, currentPage, pagesAvailable, recentTransactions);
                }));
            }
        }
        var max = pagesAvailable.length < (this.state.range * 5) + 5 ? pagesAvailable.length : (this.state.range * 5) + 5;
        for (var i = this.state.range * 5; i < max; i++) {
            pages.appendChild(this.createPage(currentPage, i, pagination, recentTransactions, pages));
        }
        if (max < pagesAvailable.length) {
            pages.appendChild(this.createNavigation('Next', () => {
                this.state.range++;
                this.loadTransactionPagination(pagination, pages, currentPage, pagesAvailable, recentTransactions);
            }));
        }
    }

    loadTransactions(pagination, txPages, recentTransactions, page) {
        this.apis.getRecentTransactions(transactionResponse => {
            this.clearElement(recentTransactions);

            let currentPage = transactionResponse.page;
            let pages = transactionResponse.pagesAvailable;
            this.loadTransactionPagination(pagination, txPages, currentPage, pages, recentTransactions);

            let transactions = transactionResponse.results;
            if (transactions.length > 0) {
                recentTransactions.hidden = false;
            } else {
                recentTransactions.hidden = true;
            }

            transactions.forEach(transaction => {
                var date = document.createElement('td');
                date.appendChild(document.createTextNode(transaction.transactionTime));

                var detail = transaction.counterparty;

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

                var row = document.createElement("tr");
                if (transaction.status === 'PENDING') {
                    row.className += "table-secondary";
                }
                if (transaction.status === 'REVERSED') {
                    row.className += "table-info";
                }

                var txDetails = document.createElement('td');
                txDetails.appendChild(document.createTextNode(detail));

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

                recentTransactions.appendChild(row);

                refresh.addEventListener('click', e => {
                    this.apis.requestTransactionUpdate(transaction.uid, tx => {
                        this.loadTransactions(pagination, pages, recentTransactions);
                    });
                });
            });
        }, page);
    }

    loadMonthsDropDown(monthlySpendingChartContainer, incomeExpenseChartContainer, monthsDropDown) {
        monthsDropDown.addEventListener('change', e => {
            var selectedPeriod = monthsDropDown.value;
            var selectedItem = selectedPeriod.split('-');
            var selectedMonth = selectedItem[1];
            var selectedYear = selectedItem[0];
            this.loadMonthlyChartForSpecificMonth(monthlySpendingChartContainer, incomeExpenseChartContainer, selectedMonth, selectedYear);
        });
        this.apis.getAvailableMonths(months => {
            months.forEach(m => {
                var option = document.createElement('option');
                option.value = m;
                option.appendChild(document.createTextNode(m));
                monthsDropDown.appendChild(option);
            });
        });
    }

    createMonthlySpendingChart(monthlySpendingChartContainer, labels, data) {
        this.clearElement(monthlySpendingChartContainer);
        var monthlySpending = new Chart(monthlySpendingChartContainer, {
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

    loadMonthlySpendingCategoryChart(monthlySpendingChartContainer, monthlySpending) {
        var spendingLabels = [];
        var spendingData = [];
        monthlySpending.spendingCategoryLineItems.forEach(item => {
            if (item.category !== 'INCOME') {
                spendingLabels.push(item.category);
                spendingData.push(item.amount * -1);
            }
        });
        this.createMonthlySpendingChart(monthlySpendingChartContainer, spendingLabels, spendingData);
    }

    loadMonthlyIncomeExpensesChart(incomeExpenseChartContainer, monthlySpending) {
        var income = 0;
        var expenses = 0;
        monthlySpending.spendingCategoryLineItems.forEach(item => {
            if (item.amount < 0) {
                expenses += (item.amount * -1);
            } else {
                income += item.amount;
            }
        });
        this.createMonthlyIncomeExpenseChart(incomeExpenseChartContainer, income, expenses)
    }

    loadMonthlySpendingChart(monthlySpendingChartContainer, incomeExpenseChartContainer) {
        this.apis.getMonthlySpending(monthlySpending => {
            this.loadMonthlySpendingCategoryChart(monthlySpendingChartContainer, monthlySpending);
            this.loadMonthlyIncomeExpensesChart(incomeExpenseChartContainer, monthlySpending);
        });
    }

    loadMonthlyChartForSpecificMonth(monthlySpendingChartContainer, incomeExpenseChartContainer, month, year) {
        this.apis.getMonthlySpendingForPeriod(month, year, monthlySpending => {
            this.loadMonthlySpendingCategoryChart(monthlySpendingChartContainer, monthlySpending);
            this.loadMonthlyIncomeExpensesChart(incomeExpenseChartContainer, monthlySpending);
        });
    }

    createMonthlyIncomeExpenseChart(ctx, income, expenses) {
        this.clearElement(ctx);
        var monthlyIncomeExpense = new Chart(ctx, {
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

    loadSpendingAnalysis(analysis) {
        this.apis.getAnalysis(categoryAnalysis => {
            this.clearElement(analysis);

            if (categoryAnalysis.spendingAnalysisLineItems.length > 0) {
                analysis.hidden = false;
            } else {
                analysis.hidden = true;
            }

            categoryAnalysis.spendingAnalysisLineItems.forEach(lineItem => {
                var category = document.createElement('td');
                category.appendChild(document.createTextNode(lineItem.spendingCategory));

                var min = document.createElement('td');
                var minAmt = lineItem.min.toFixed(2);
                min.appendChild(document.createTextNode(minAmt));

                var max = document.createElement('td');
                var maxAmnt = lineItem.max.toFixed(2);
                max.appendChild(document.createTextNode(maxAmnt));

                var mean = document.createElement('td');
                var meanAmnt = lineItem.mean.toFixed(2);
                mean.appendChild(document.createTextNode(meanAmnt));

                var stddev = document.createElement('td');
                var stddevAmnt = lineItem.standardDeviation.toFixed(2);
                stddev.appendChild(document.createTextNode(stddevAmnt));

                var row = document.createElement("tr");
                row.appendChild(category);
                row.appendChild(min);
                row.appendChild(max);
                row.appendChild(mean);
                row.appendChild(stddev);

                analysis.appendChild(row);
            });
        });
    }
}