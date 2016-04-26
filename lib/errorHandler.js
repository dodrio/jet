'use strict';

function errorHandler(err) {
  console.log(`Jet: got an error - ${err.message}`);
}

module.exports = errorHandler;
