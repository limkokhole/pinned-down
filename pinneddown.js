var util = require('util'), 
	fs = require('fs'),
	scraper = require('scraper'),
	wget = require('wget'),
	baseUrl = 'http://pinterest.com/';
	argv = require('optimist')
		.usage('Usage: $0 --user=username --output=/path/ --board=[optional]')
		.demand(['user', 'output']).argv;

var getExtension = function(str) {
	return str.split('.').pop();
};

var buildUrl = function(pages) {
	return baseUrl + pages.join('/').replace(/\/\//g, '/');
};

var buildFolder = function(path) {
	return argv.output + path.join('/').replace(/\/\//g, '/');
};

var clean = function(folder) {
	return folder.toLowerCase().replace(/\//g, '').replace(/ /g, '_');
};

var prepareFileName = function(folder, elem) {
	return folder +"/"+ elem.data('id') + "." + getExtension(elem.data('closeup-url'));
};

var downloadFromBoard = function(board, folder) {
	scraper(buildUrl([board]), function(err, $, options) {
		var i = 1;
		
		if(err) {
			throw err;
		}

		var pins = $(".pin");
			
		console.log('Found '+ pins.length + " pins on board "+ board);

		pins.each(function(i, elem) {
			var output = prepareFileName(folder, $(elem));

			console.log('Downloading '+ $(elem).data('closeup-url') + " to "+ output);

			var download = wget.download(
				$(elem).data('closeup-url'), 
				output
			);
		});
	});
};

var scrape = function() {
	scraper(buildUrl([argv.user]), function(err, $, options) {
		if(err) {
			throw err;
		}

		var boards = $('.board');
		
		if(!argv.board) {
			console.log('Found ' + boards.length + " boards");
		}

		boards.each(function(i, elem) {
			// create a new folder in the path
			var title = $(elem).siblings(".serif").first().text(),
				include = true,
				board = $(elem).siblings(".serif").find("a").first().attr('href');

			var folder = buildFolder([clean(title)]);

			// board should be url 
			if(argv.board) {
				if(board != ("/" + argv.user + "/" + argv.board + "/")) {
					include = false;
				}
			}

			if(include) {
				if(argv.board) {
					// don't save in nested folder
					downloadFromBoard(board, argv.output);
				}
				else {
					fs.exists(folder, function(exists) {
						console.log('Creating folder for '+ title + " at "+ folder);

						if(!exists) {
							fs.mkdir(folder, function(err) {
								if(err) {
									throw err;
								}

								downloadFromBoard(board, folder)
							});
						}
						else {
							downloadFromBoard(board, folder);
						}
					});
				}
			}
		});
	}, {
        'reqPerSec': 2
    });
};

console.log(
	(argv.board) ? "Downloading pins from "+ argv.user +"/"+ argv.board : 'Downloading pins from '+ argv.user
);

fs.exists(argv.output, function(exists) {
	if(!exists) {
		fs.mkdir(argv.output, function(err) {
			scrape();
		});
	}
	else {
		scrape();
	}
});
