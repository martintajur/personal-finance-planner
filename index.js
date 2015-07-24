var GoogleSpreadsheet = require('google-spreadsheet'),
	config = require('./config.json'),
	sheet = new GoogleSpreadsheet(config.spreadsheetId),
	creds = require('./credentials.json'),
	async = require('async'),
	numeral = require('numeral'),
	expenses = [],
	incomes = [];

async.waterfall([
	function(callback) {
		sheet.useServiceAccountAuth(creds, callback);
	},
	function(callback) {
		sheet.getInfo(callback);
	},
	function(sheetInfo, callback) {
		// fetch expenses
		sheetInfo.worksheets[0].getRows(function(err, rows) {
			if (err) {
				throw err;
			}
			rows.forEach(function(row) {
				expenses.push({
					date: new Date(row.date),
					sum: numeral().unformat(row.sum),
					reason: row.reason,
					recurring: row.recurring
				});
			});

			callback(null, sheetInfo);
		});
	},
	function(sheetInfo, callback) {
		// fetch incomes
		sheetInfo.worksheets[1].getRows(function(err, rows) {
			if (err) {
				throw err;
			}
			rows.forEach(function(row) {
				incomes.push({
					date: new Date(row.date),
					sum: numeral().unformat(row.sum),
					reason: row.reason,
					recurring: row.recurring
				});
			});

			callback(null, sheetInfo);
		});
	}
], function(err, result) {
	if (err) {
		throw err;
	}

	console.log('expenses', expenses, '\n\nincomes', incomes);
});
