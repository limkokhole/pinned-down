# Pinned Down

Small node script to download all a given Pinterest users public boards.

## Requirements

- Node
- NPM

## Usage

	git clone https://github.com/wilr/pinned-down.git
	cd pinned-down
	npm install

	node pinneddown.js --user=wilr --output=/Users/Will/Documents/Pinterest/

That download all the pins for that user into folders organized by board.

To download a single particular board:

	node pinneddown.js --user=wilr --board=house-ideas --output=/Users/Will/Documents/House/