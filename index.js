var GoogleSpreadsheet = require('google-spreadsheet'),
	config = require('./config.json'),
	colors = require('colors'),
	sheet = new GoogleSpreadsheet(config.spreadsheetId),
	creds = require('./credentials.json'),
	async = require('async'),
	numeral = require('numeral'),
	moment = require('moment'),
	_ = require('lodash'),
	transactions = [],
	startingBalance = 0,
	minimumCashReserve = 10000,
	resultsSheet = false,
	earliestDate = new Date(),
	farthestDate = new Date();

async.waterfall([
	function configureGoogleAuth(callback) {
		sheet.useServiceAccountAuth(creds, callback);
	},
	function getSheetInfo(callback) {
		sheet.getInfo(callback);
	},
	function saveResultsSheetRef(sheetInfo, callback) {
		// store reference
		resultsSheet = sheetInfo.worksheets[2];
		callback(null, sheetInfo);
	},
	function readExpenses(sheetInfo, callback) {

		// fetch expenses
		sheetInfo.worksheets[0].getRows(function(err, rows) {
			if (err) {
				throw err;
			}
			rows.forEach(function(row) {
				transactions.push({
					type: 'expense',
					date: moment(row.date).startOf('day').toDate(),
					sum: 0 - numeral().unformat(row.sum),
					reason: row.reason,
					recurring: row.recurring
				});
			});

			callback(null, sheetInfo);
		});
	},
	function readIncomes(sheetInfo, callback) {
		// fetch incomes
		sheetInfo.worksheets[1].getRows(function(err, rows) {
			if (err) {
				throw err;
			}
			rows.forEach(function(row) {
				transactions.push({
					type: 'income',
					date: moment(row.date).startOf('day').toDate(),
					sum: numeral().unformat(row.sum),
					reason: row.reason,
					recurring: row.recurring
				});
			});

			callback(null);
		});
	},
	function extendMonthlyRecurringTransactionsWithKnownDuration(callback) {
		_.clone(transactions).forEach(function(transaction) {
			var monthsToRecurr = 1;

			if (transaction.recurring.match(/[0-9]+ months/g) || transaction.recurring.match(/^[0-9]+$/g)) {
				monthsToRecurr = numeral().unformat(transaction.recurring.replace(/[a-z]+/ig, '').trim());
			}

			recurrTransaction(transaction, monthsToRecurr);
		});
		callback(null);
	},
	function determineEarliestDate(callback) {
		transactions.forEach(function(transaction) {
			if (transaction.date.getTime() < earliestDate.getTime()) {
				earliestDate = transaction.date;
			}
		});
		callback(null);
	},
	function determineFarthestDate(callback) {
		transactions.forEach(function(transaction) {
			if (transaction.date.getTime() > farthestDate.getTime()) {
				farthestDate = transaction.date;
			}
		});
		console.log(farthestDate);
		callback(null);
	},
	function extendMonthlyRecurringTransactions(callback) {
		_.clone(transactions).forEach(function(transaction) {
			var monthsToRecurr = 1;

			if (transaction.recurring == 'monthly' && !transaction.recurrence) {
				monthsToRecurr = Math.ceil((moment(farthestDate).add(1, 'month').startOf('day').toDate().getTime() - moment(transaction.date).subtract(1, 'day').startOf('day').toDate().getTime()) / 1000 / 86400 / 28);
			}

			recurrTransaction(transaction, monthsToRecurr);
		});
		callback(null);
	},
	function sortTransactions(callback) {
		transactions.sort(function(a, b) {
			var at = a.date.getTime(),
				bt = b.date.getTime();
			if (at < bt) {
				return -1;
			}
			else if (at > bt) {
				return 1;
			}
			else {
				return 0;
			}
		});
		callback(null);
	},
	function createDailyBalances(callback) {
		var balancePointer = startingBalance,
			daysToFarthestDate = Math.ceil((moment(farthestDate).add(1, 'day').toDate().getTime() - moment(earliestDate).subtract(1, 'day').toDate().getTime()) / 1000 / 86400);

		_.each(_.range(0, daysToFarthestDate), function(d) {
			var now = moment(earliestDate.toISOString()).add(d, 'days').startOf('day');
			var transactionsOnDay = _.where(transactions, { date: now.toDate() });

			_.each(transactionsOnDay, function(transaction) {
				balancePointer = balancePointer + transaction.sum;

				console.log(colors[(balancePointer < minimumCashReserve ? 'red' : 'green')](now.format('YYYY-MM-DD') + '	' + balancePointer + '	' + transaction.reason + '	' + transaction.sum));
			});

		});

		callback(null);
	}
], function(err, result) {
	if (err) {
		throw err;
	}
});

function recurrTransaction(transaction, monthsToRecurr) {
	_.each(_.range(1, monthsToRecurr), function(i) {
		var then = moment(transaction.date).add(i, 'months').startOf('day');
		var recurrenceTransaction = _.clone(transaction);
		recurrenceTransaction.recurrence = true;
		recurrenceTransaction.date = then.toDate();
		recurrenceTransaction.reason += ' (' + then.format('MMMM YYYY') + ')';
		transactions.push(recurrenceTransaction);
	});
}