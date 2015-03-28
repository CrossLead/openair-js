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
var service = new OpenAir.Service(config);

console.log('Creating OpenAir connection');

service
  .init()
  .then(function( /*client*/ ) {
    console.log('Service initialized. Service description:');
    console.log(service.config.client.describe());
    console.log('Last Request:');
    console.log(service.config.client.lastRequest);
  })
  .catch(function(err) {
    console.error(err);
    console.error('Last Request:');
    console.error(service.config.client.lastRequest);
  });
