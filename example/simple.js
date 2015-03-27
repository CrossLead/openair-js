/*
 * openair-js
 * https://github.com/CrossLead/openair-js
 *
 * Copyright (c) 2015 Christian Yang
 * Licensed under the Apache license.
 */

'use strict';

var denodeify = require('denodeify');
var OpenAir = require('../');

var credentials = require('./credentials.json');
var config = new OpenAir.Configuration(credentials);

console.log('Creating OpenAir connection');

config.createConnection()
  .then(function(client) {
    console.log('WSDL processed. Service description:');
    console.log(client.describe());
  })
  .catch(function(err) {
    console.error(err);
  });
